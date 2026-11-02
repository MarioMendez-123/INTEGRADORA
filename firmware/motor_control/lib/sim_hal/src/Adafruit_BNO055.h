// Lo mínimo de la librería de Adafruit que usa el carrito: begin() y getEvent() con la orientación.
#pragma once
#include "Wire.h"
struct sensors_vec_t { float x = 0, y = 0, z = 0; };
struct sensors_event_t { sensors_vec_t orientation; };
class Adafruit_BNO055 {
 public:
  Adafruit_BNO055(int32_t id = -1, uint8_t dir = 0x28, TwoWire* w = &Wire) { (void)id; (void)dir; (void)w; }
  bool begin(int modo = 0x08);
  bool getEvent(sensors_event_t* ev);
  void setExtCrystalUse(bool) {}
};
#define OPERATION_MODE_IMUPLUS 0x08
#define OPERATION_MODE_NDOF 0x0C
