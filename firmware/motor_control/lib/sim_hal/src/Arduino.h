// Arduino de mentiras para el entorno native: mismas funciones que usa el firmware del ESP32,
// pero cada una se la pide al ESP32 virtual del simulador.
#pragma once
#include <cmath>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <string>
#include "sim_hal.h"

typedef uint8_t byte;
#define HIGH 1
#define LOW 0
#define INPUT 0x01
#define OUTPUT 0x03
#define INPUT_PULLUP 0x05
#define INPUT_PULLDOWN 0x09
#define SERIAL_8N1 0x800001c
#ifndef PI
#define PI 3.14159265358979323846
#endif
#define constrain(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))

void pinMode(uint8_t pin, uint8_t modo);
void digitalWrite(uint8_t pin, uint8_t nivel);
int digitalRead(uint8_t pin);
uint32_t analogReadMilliVolts(uint8_t pin);
uint16_t analogRead(uint8_t pin);
unsigned long millis();
unsigned long micros();
void delay(uint32_t ms);
void delayMicroseconds(uint32_t us);
void yield();

class Print {
 public:
  virtual ~Print() {}
  virtual size_t write(uint8_t c) { return write(&c, 1); }
  virtual size_t write(const uint8_t* d, size_t n) = 0;
  size_t write(const char* s) { return write((const uint8_t*)s, strlen(s)); }
  size_t print(const char* s) { return write(s); }
  size_t print(char c) { return write((uint8_t)c); }
  size_t print(int v) { return printf("%d", v); }
  size_t print(unsigned v) { return printf("%u", v); }
  size_t print(long v) { return printf("%ld", v); }
  size_t print(unsigned long v) { return printf("%lu", v); }
  size_t print(double v, int dec = 2) { return printf("%.*f", dec, v); }
  template <class T> size_t println(T v) { size_t n = print(v); return n + write("\r\n"); }
  size_t println(double v, int dec) { size_t n = print(v, dec); return n + write("\r\n"); }
  size_t println() { return write("\r\n"); }
  size_t printf(const char* fmt, ...) {
    char buf[512]; va_list ap; va_start(ap, fmt); int n = vsnprintf(buf, sizeof buf, fmt, ap); va_end(ap);
    return write((const uint8_t*)buf, n < 0 ? 0 : (size_t)n);
  }
};

class Stream : public Print {
 public:
  virtual int available() = 0;
  virtual int read() = 0;
  virtual int peek() = 0;
  size_t readBytes(uint8_t* out, size_t n) {
    size_t k = 0; unsigned long t0 = millis();
    while (k < n && millis() - t0 < 1000) { if (available()) out[k++] = (uint8_t)read(); else delay(1); }
    return k;
  }
};

// uart 0 = el USB hacia la Jetson (Serial), uart 2 = hacia el MAX485 (HardwareSerial bus(2))
class HardwareSerial : public Stream {
 public:
  explicit HardwareSerial(int uart) : uart_(uart) {}
  void begin(unsigned long baud, uint32_t config = SERIAL_8N1, int8_t rx = -1, int8_t tx = -1);
  void end() {}
  size_t write(const uint8_t* d, size_t n) override;
  using Print::write;
  int available() override;
  int read() override;
  int peek() override;
  void flush();
  operator bool() const { return true; }
 private:
  void llenar();
  int uart_;
  unsigned long baud_ = 115200;
  std::deque<uint8_t> rx_;
  unsigned long tx_hasta_us_ = 0;
};
extern HardwareSerial Serial;
extern HardwareSerial Serial2;

void setup();
void loop();
