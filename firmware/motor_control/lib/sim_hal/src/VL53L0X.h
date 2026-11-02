// Igual (en lo que usa el carrito) a la librería de Pololu, pero contra el simulador.
#pragma once
#include "Wire.h"
class VL53L0X {
 public:
  void setBus(TwoWire*) {}
  void setAddress(uint8_t nueva);
  uint8_t getAddress() { return dir_; }
  bool init(bool io_2v8 = true);
  void setTimeout(uint16_t ms) { timeout_ = ms; }
  void startContinuous(uint32_t = 0) {}
  void stopContinuous() {}
  uint16_t readRangeContinuousMillimeters();
  uint16_t readRangeSingleMillimeters() { return readRangeContinuousMillimeters(); }
  bool timeoutOccurred() { bool t = hubo_; hubo_ = false; return t; }
  bool setMeasurementTimingBudget(uint32_t) { return true; }
 private:
  uint8_t dir_ = 0x29;
  uint16_t timeout_ = 0;
  bool hubo_ = false;
};
