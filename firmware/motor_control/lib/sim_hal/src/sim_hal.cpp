// Implementación del Arduino de mentiras: todo pasa por una conexión TCP con el simulador.
#include "Arduino.h"
#include "Adafruit_BNO055.h"
#include "VL53L0X.h"
#include "Wire.h"

#include <chrono>
#include <thread>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#include <mmsystem.h>
typedef SOCKET socket_t;
#else
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <sys/socket.h>
#include <unistd.h>
typedef int socket_t;
#define INVALID_SOCKET (-1)
#define closesocket close
#endif

namespace {
socket_t conexion = INVALID_SOCKET;
std::string pendiente;
const auto inicio = std::chrono::steady_clock::now();

void enviar_crudo(const std::string& s) {
  size_t k = 0;
  while (k < s.size()) {
    int n = send(conexion, s.data() + k, (int)(s.size() - k), 0);
    if (n <= 0) { fprintf(stderr, "Se cerró la conexión con el simulador\n"); exit(0); }
    k += (size_t)n;
  }
}
}  // namespace

namespace sim {
void conectar() {
#ifdef _WIN32
  WSADATA w;
  WSAStartup(MAKEWORD(2, 2), &w);
#endif
  for (int intento = 0; intento < 50; intento++) {
    conexion = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in dir{};
    dir.sin_family = AF_INET;
    dir.sin_port = htons(7700);
    dir.sin_addr.s_addr = htonl(0x7F000001);
    if (connect(conexion, (sockaddr*)&dir, sizeof dir) == 0) {
      int uno = 1;
      setsockopt(conexion, IPPROTO_TCP, TCP_NODELAY, (const char*)&uno, sizeof uno);
      preguntar("HOLA nativo");
      return;
    }
    closesocket(conexion);
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
  }
  fprintf(stderr, "No encontré el simulador en 127.0.0.1:7700. ¿Está corriendo sim/servidor.py?\n");
  exit(1);
}
void enviar(const std::string& linea) { enviar_crudo(linea + "\n"); }
std::string preguntar(const std::string& linea) {
  enviar(linea);
  for (;;) {
    size_t fin = pendiente.find('\n');
    if (fin != std::string::npos) {
      std::string r = pendiente.substr(0, fin);
      pendiente.erase(0, fin + 1);
      return r;
    }
    char buf[4096];
    int n = recv(conexion, buf, sizeof buf, 0);
    if (n <= 0) { fprintf(stderr, "Se cerró la conexión con el simulador\n"); exit(0); }
    pendiente.append(buf, (size_t)n);
  }
}
std::string hex(const uint8_t* d, size_t n) {
  static const char* H = "0123456789abcdef";
  std::string s;
  for (size_t i = 0; i < n; i++) { s += H[d[i] >> 4]; s += H[d[i] & 15]; }
  return s;
}
size_t deshex(const std::string& h, uint8_t* out, size_t max) {
  size_t n = 0;
  for (size_t i = 0; i + 1 < h.size() && n < max; i += 2) out[n++] = (uint8_t)strtol(h.substr(i, 2).c_str(), nullptr, 16);
  return n;
}
}  // namespace sim

// ------------------------------------------------------------------ pines y tiempo
void pinMode(uint8_t pin, uint8_t modo) {
  const char* m = modo == OUTPUT ? "O" : modo == INPUT_PULLUP ? "U" : modo == INPUT_PULLDOWN ? "D" : "I";
  sim::enviar("PM " + std::to_string(pin) + " " + m);
}
void digitalWrite(uint8_t pin, uint8_t nivel) { sim::enviar("DW " + std::to_string(pin) + " " + (nivel ? "1" : "0")); }
int digitalRead(uint8_t pin) { return atoi(sim::preguntar("DR? " + std::to_string(pin)).c_str()); }
uint32_t analogReadMilliVolts(uint8_t pin) { return (uint32_t)atoi(sim::preguntar("AR? " + std::to_string(pin)).c_str()); }
uint16_t analogRead(uint8_t pin) { return (uint16_t)(analogReadMilliVolts(pin) * 4095 / 3300); }
unsigned long millis() { return (unsigned long)std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - inicio).count(); }
unsigned long micros() { return (unsigned long)std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::steady_clock::now() - inicio).count(); }
void delay(uint32_t ms) { std::this_thread::sleep_for(std::chrono::milliseconds(ms)); }
void delayMicroseconds(uint32_t us) { std::this_thread::sleep_for(std::chrono::microseconds(us)); }
void yield() {}

// ------------------------------------------------------------------ UART
HardwareSerial Serial(0);
HardwareSerial Serial2(2);

void HardwareSerial::begin(unsigned long baud, uint32_t, int8_t rx, int8_t tx) {
  baud_ = baud;
  if (uart_ == 2) sim::enviar("U2 " + std::to_string(baud) + " " + std::to_string(rx < 0 ? 16 : rx) + " " + std::to_string(tx < 0 ? 17 : tx));
}
size_t HardwareSerial::write(const uint8_t* d, size_t n) {
  if (n == 0) return 0;
  sim::enviar((uart_ == 2 ? "U2W " : "U0W ") + sim::hex(d, n));
  tx_hasta_us_ = micros() + (unsigned long)(n * 10 * 1000000ULL / baud_);
  return n;
}
void HardwareSerial::flush() {                    // espera a que salga el último byte, como el real
  while ((long)(tx_hasta_us_ - micros()) > 0) std::this_thread::sleep_for(std::chrono::microseconds(50));
}
void HardwareSerial::llenar() {
  std::string r = sim::preguntar(uart_ == 2 ? "U2R?" : "U0R?");
  if (r == "-") return;
  uint8_t buf[2048];
  size_t n = sim::deshex(r, buf, sizeof buf);
  rx_.insert(rx_.end(), buf, buf + n);
}
int HardwareSerial::available() { if (rx_.empty()) llenar(); return (int)rx_.size(); }
int HardwareSerial::read() { if (rx_.empty()) llenar(); if (rx_.empty()) return -1; int c = rx_.front(); rx_.pop_front(); return c; }
int HardwareSerial::peek() { if (rx_.empty()) llenar(); return rx_.empty() ? -1 : rx_.front(); }

// ------------------------------------------------------------------ I2C y sensores
TwoWire Wire;
bool TwoWire::begin(int sda, int scl, uint32_t) { sim::enviar("IB " + std::to_string(sda) + " " + std::to_string(scl)); return true; }

void VL53L0X::setAddress(uint8_t nueva) {
  if (sim::preguntar("VA? " + std::to_string(dir_) + " " + std::to_string(nueva)) == "1") dir_ = nueva & 0x7F;
}
bool VL53L0X::init(bool) { return sim::preguntar("VI? " + std::to_string(dir_)) == "1"; }
uint16_t VL53L0X::readRangeContinuousMillimeters() {
  int mm = atoi(sim::preguntar("VR? " + std::to_string(dir_)).c_str());
  if (mm < 0) { if (timeout_) delay(timeout_); hubo_ = true; return 65535; }
  return (uint16_t)mm;
}

bool Adafruit_BNO055::begin(int) { return sim::preguntar("BI?") == "1"; }
bool Adafruit_BNO055::getEvent(sensors_event_t* ev) {
  std::string r = sim::preguntar("BE?");
  if (r == "-") return false;
  sscanf(r.c_str(), "%f %f %f", &ev->orientation.x, &ev->orientation.y, &ev->orientation.z);
  return true;
}

// ------------------------------------------------------------------ arranque
int main() {
  setvbuf(stdout, nullptr, _IONBF, 0);
#ifdef _WIN32
  timeBeginPeriod(1);                             // sin esto, Windows duerme de 15 en 15 ms y se pierde el ritmo de 50 Hz
#endif
  sim::conectar();
  setup();
  for (;;) loop();
}
