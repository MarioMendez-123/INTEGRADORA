// Conexión con el ESP32 virtual del simulador (sim/servidor.py, puerto 7700). Solo para el entorno native.
#pragma once
#include <cstdint>
#include <string>

namespace sim {
void conectar();                                 // la llama main() antes de setup()
void enviar(const std::string& linea);           // orden sin respuesta
std::string preguntar(const std::string& linea); // orden que espera una línea de respuesta
std::string hex(const uint8_t* d, size_t n);
size_t deshex(const std::string& h, uint8_t* out, size_t max);
}
