#pragma once
#include "Arduino.h"
class TwoWire {
 public:
  bool begin(int sda = 21, int scl = 22, uint32_t freq = 100000);
  void setClock(uint32_t) {}
};
extern TwoWire Wire;
