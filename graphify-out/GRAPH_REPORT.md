# Graph Report - INTEGRADORAAHORASI  (2026-10-21)

## Corpus Check
- Large corpus: 508 files · ~524,056 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2336 nodes · 4062 edges · 182 communities (133 shown, 49 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 241 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Motor de audio (engine.js)
- Robot Lumina (UI)
- Criterios de aceptacion MVP
- Publicador de camara
- Celda real (PLC/Modbus)
- Visor 3D del carrito
- Refresco de inventario
- Carga de inventario desde edge
- Lumina escritorio
- Lumina web (JS)
- Dataset de piezas (UI)
- Dashboard app.js
- Almacen de dataset
- Figuras de hardware
- Demo overlay (video)
- Armado 3D del carrito
- Ensamblado del informe
- Musica del video
- Pruebas del backend
- Escena Aether (video)
- Utilidades Lumina escritorio
- Generador del documento maestro
- Pruebas del dataset
- Endpoints de la API
- Conversacion con Lumina
- Pruebas de Lumina escritorio
- Glifos y primitivas
- Analisis del video
- Instrumentacion e2e
- Sesion de celda y dataset (API)
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 160
- Community 180
- Community 181

## God Nodes (most connected - your core abstractions)
1. `_run()` - 46 edges
2. `prog()` - 35 edges
3. `at()` - 26 edges
4. `react` - 22 edges
5. `handleVoiceCommand()` - 19 edges
6. `Stage()` - 18 edges
7. `center()` - 18 edges
8. `scripts` - 17 edges
9. `C` - 17 edges
10. `lerp()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `aether-video README` --semantically_similar_to--> `Video clicker ?clicker=1`  [INFERRED] [semantically similar]
  aether-video/README.md → HANDOFF_LUMINA.md
- `Programa agente_celda.py de la Pi 4` --semantically_similar_to--> `Agente de celda (Python, Raspberry, Modbus + HTTP 8080)`  [INFERRED] [semantically similar]
  graphify-out/converted/Aether-documento-maestro_647e0875.md → docs/hardware/datasheet-conexion-celda.md
- `Vision de linea binaria PIEZA DETECTADA / SIN PIEZA` --semantically_similar_to--> `Criterio PASS/FAIL aun no existe; presencia no es FAIL`  [INFERRED] [semantically similar]
  graphify-out/converted/AETHER_Informe_Integrador_2008303d.md → docs/hardware/datasheet-conexion-celda.md
- `Contrato REST (opcion B, celda, opcion C pendiente)` --semantically_similar_to--> `11 endpoints reales de backend/main.py`  [INFERRED] [semantically similar]
  contracts/rest_api.md → ActFinal.md
- `Principio 4.1 honestidad / 4.5 no fabricar` --semantically_similar_to--> `Ningun numero de inventario sin su estado de cobertura`  [INFERRED] [semantically similar]
  graphify-out/converted/AETHER_Informe_Integrador_2008303d.md → docs/architecture/decisions/criterios_aceptacion.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Camera-to-dashboard data pipeline** — aether_report_package_aether_informe_integrador_perception, aether_report_package_aether_informe_integrador_inv_engine, aether_report_package_aether_informe_integrador_backend, aether_report_package_aether_informe_integrador_dashboard [EXTRACTED 1.00]
- **Four-station manufacturing line** — aether_report_package_aether_informe_integrador_line, aether_report_package_aether_informe_integrador_linevision, aether_report_package_aether_informe_integrador_mobile, aether_report_package_aether_informe_integrador_handshake [EXTRACTED 1.00]
- **Manufacturing line station flow** — aether_report_package_aether_informe_integrador_v2_kuka_kr6, aether_report_package_aether_informe_integrador_v2_ur5, aether_report_package_aether_informe_integrador_v2_vision_binary, aether_report_package_aether_informe_integrador_v2_aether_inventory [EXTRACTED 1.00]
- **Perception to dashboard pipeline** — aether_report_package_aether_informe_integrador_v2_hybrid_perception, aether_report_package_aether_informe_integrador_v2_inventory_engine, aether_report_package_aether_informe_integrador_v2_backend, aether_report_package_aether_informe_integrador_v2_dashboard [INFERRED 0.85]
- **Pipeline de modelado de piezas 3D** — dashboard_armado_builder, dashboard_armado_addpart, dashboard_armado_structure_pf3030, dashboard_armado_tower_elevator [INFERRED 0.85]
- **Flujo de reproducción de pasos** — dashboard_armado_chapters_steps, dashboard_armado_applyat_evalpart, dashboard_armado_mountmatrix, dashboard_armado_frame_loop [EXTRACTED 1.00]
- **Revelado del interior por voz (Lumina)** — dashboard_armado_listenlumina, dashboard_armado_reveal_interior, dashboard_armado_embed_mode [INFERRED 0.75]
- **Flujo de voz de Lumina** — aether_dictado_lumina_resolution_order, aether_video_phase0_report_tts_flow, aether_dictado_lumina_desktop_actions [INFERRED 0.75]
- **Flujo de decision de linea PASS/FAIL a piston** — aether_dictado_cell_wiring_modbus, contracts_line_handshake_protocol_event_a, contracts_line_handshake_protocol_event_b [INFERRED 0.75]
- **Sincronia del show video Lumina** — aether_video_readme_websocket_relay, aether_video_readme_clicker, aether_video_verificacion_sync_results [INFERRED 0.75]
- **Flujo banda-vision-piston** — dashboard_index_linea, docs_architecture_decisions_0010_linea_banda_piston_decision, dashboard_celda_linevision [INFERRED 0.85]
- **Documentos historicos superados** — docs_academic_ai_context_sup, docs_academic_arquitectura_ideal_sup, docs_architecture_decisions_0008_integracion_manipulacion_file [EXTRACTED 0.75]
- **Pantallas de laboratorio fuera del dominio publico** — dashboard_robots_disallow, dashboard_celda_file, dashboard_inventory_file [EXTRACTED 0.75]
- **Laptop, Raspberry y PLC en el mismo switch** — docs_hardware_conexion_de_la_celda_raspberry, docs_hardware_conexion_de_la_celda_plc, docs_hardware_conexion_de_la_celda_switch [EXTRACTED 0.95]
- **Documentos del cableado de la celda** — docs_hardware_datasheet_conexion_celda, graphify_out_converted_conexion_de_la_celda_d46a07b0, graphify_out_converted_aether_documento_maestro_647e0875, docs_hardware_guia_de_construccion [INFERRED 0.85]
- **Endurecimiento de dominio Cloudflare** — docs_security_runbook_cloudflare, docs_security_reporte, docs_security_laboratorio [INFERRED 0.75]
- **Lumina voice pipeline (speech recognition, Ollama LLM, face and speech output)** — lumina_agent_readme_web_speech_api, lumina_agent_readme_lumina_backend, lumina_agent_readme_ollama, lumina_agent_web_index_html_face_svg [INFERRED 0.85]
- **Perception to dashboard data pipeline** — aether_report_package_assets_diagram_architecture_percepcion, aether_report_package_assets_diagram_architecture_inventory_engine, aether_report_package_assets_diagram_architecture_backend, aether_report_package_assets_diagram_architecture_database, aether_report_package_assets_diagram_architecture_dashboard [EXTRACTED 1.00]
- **Manufacturing line station flow** — aether_report_package_assets_dashboard_manufacturing_line_real_kuka_kr6, aether_report_package_assets_dashboard_manufacturing_line_real_ur5, aether_report_package_assets_dashboard_manufacturing_line_real_vision, aether_report_package_assets_dashboard_manufacturing_line_real_aether_inventory [EXTRACTED 1.00]
- **PLC I/O wiring: IR1, IR2, piston** — docs_hardware_build_figuras_02_cables_plc, docs_hardware_build_figuras_02_cables_sensores_ir, docs_hardware_build_figuras_02_cables_piston [EXTRACTED 1.00]
- **Ethernet star via switch** — docs_hardware_build_figuras_02_cables_switch, docs_hardware_build_figuras_02_cables_raspberry, docs_hardware_build_figuras_02_cables_laptop, docs_hardware_build_figuras_02_cables_plc [EXTRACTED 1.00]
- **Laptop, Raspberry and PLC on one switch** — docs_hardware__build_figuras_06_red_laptop, docs_hardware__build_figuras_06_red_raspberry, docs_hardware__build_figuras_06_red_plc [EXTRACTED 1.00]
- **Robot hardware documentation figures (power, wiring, comms)** — docs_hardware_figuras_03_robot_alimentacion_fig, docs_hardware_figuras_04_robot_cableado_fig, docs_hardware_figuras_05_comunicaciones_fig [INFERRED 0.85]

## Communities (182 total, 49 thin omitted)

### Community 0 - "Motor de audio (engine.js)"
Cohesion: 0.05
Nodes (65): active(), BAR, bass(), BEAT, BEDS, bell(), BPM, createRig() (+57 more)

### Community 1 - "Robot Lumina (UI)"
Cohesion: 0.04
Nodes (54): ACCENT_VAR, activateBtn, bootFlashEl, bootHiddenBtn, bootScreenEl, browLeftEl, browRightEl, cameraConnectingEl (+46 more)

### Community 2 - "Criterios de aceptacion MVP"
Cohesion: 0.05
Nodes (57): Criterios de Aceptacion del MVP, Fuera de alcance del MVP (criterio negativo), Ningun numero de inventario sin su estado de cobertura, Parada de seguridad funciona con red desconectada, Criterios linea de manufactura (banda, fixtures, piston, Aether Inventory), Umbrales numericos pendientes (no se fabrican numeros), Hoja de conexion - Raspberry, vision de linea, PLC e interfaz, Agente de celda (Python, Raspberry, Modbus + HTTP 8080) (+49 more)

### Community 3 - "Publicador de camara"
Cohesion: 0.05
Nodes (17): CameraPublisher, _deactivate(), observe(), _raise(), fake_cv2(), video_capture_factory(), FakeCapture, _noop_processor() (+9 more)

### Community 4 - "Celda real (PLC/Modbus)"
Cohesion: 0.06
Nodes (21): celda_desde_entorno(), CeldaReal, _esperar_real(), Salidas, _fails(), operating_seconds(), _piece_event(), snapshot() (+13 more)

### Community 5 - "Visor 3D del carrito"
Cohesion: 0.04
Nodes (49): ASM, asms, backP, bat, bno, board, boost, bottom (+41 more)

### Community 6 - "Refresco de inventario"
Cohesion: 0.07
Nodes (23): InventoryRefreshLoop, RefreshStatus, _blocked(), client_ip(), _header_map(), _hidden_path(), _is_local_ip(), is_restricted() (+15 more)

### Community 7 - "Carga de inventario desde edge"
Cohesion: 0.11
Nodes (12): main(), setup_logging(), main(), resolve_yolo_weights(), main(), main(), main(), main() (+4 more)

### Community 8 - "Lumina escritorio"
Cohesion: 0.08
Nodes (25): _apa_authors(), _apa_person(), _apa_reference(), _best_title(), _convert_answer(), _docs_ps(), _draft_essay(), _essay_finishing() (+17 more)

### Community 9 - "Lumina web (JS)"
Cohesion: 0.06
Nodes (35): ACCENT_VAR, bootFlashEl, bootHiddenBtn, bootScreenEl, browLeftEl, browRightEl, EXPRESSION_SOUND_CATEGORY, EXPRESSION_VOICE_PATTERNS (+27 more)

### Community 10 - "Dataset de piezas (UI)"
Cohesion: 0.08
Nodes (34): addError, addForm, addSubmit, annotateCanvas, annotateCtx, applyZoom(), boxCount, boxes (+26 more)

### Community 11 - "Dashboard app.js"
Cohesion: 0.09
Nodes (33): allEntries, autoRefreshMeta, autoRefreshStartBtn, autoRefreshStatusEl, autoRefreshStatusText, autoRefreshStopBtn, buildPreviousRunLookup(), dateFormatter (+25 more)

### Community 12 - "Almacen de dataset"
Cohesion: 0.14
Nodes (20): add_class(), _class_indices(), default_weights_file(), DuplicateSample, _images_in(), _iso(), _iter_samples(), _model_status() (+12 more)

### Community 13 - "Figuras de hardware"
Cohesion: 0.23
Nodes (26): arrow(), badge(), bornes(), _box(), cables(), center(), celda_electrico(), comunicaciones() (+18 more)

### Community 14 - "Demo overlay (video)"
Cohesion: 0.17
Nodes (21): HonestLabel(), DemoOverlay(), breath(), EASE_IN_OUT, Demo, DemoFrame(), Evolucion(), WORDS (+13 more)

### Community 15 - "Armado 3D del carrito"
Cohesion: 0.09
Nodes (29): armado.html (Armado del carrito Aether, visor 3D), addPart / PARTS, applyAt / evalPart (evaluar un instante), Builder (primitivas fusionadas por material), buildUI / seek / showStep (interfaz y transporte), flyTo / camGoal (camara), CHAPTERS y STEPS (guía de armado paso a paso), checkGeometry (revisión de choques) (+21 more)

### Community 16 - "Ensamblado del informe"
Cohesion: 0.09
Nodes (24): B, bodySection, { capitulo2 }, { capitulo3 }, { capitulo4, conclusiones, referencias }, { coverSection, frontMatter, bodyHeader, bodyFooter, bodyPageProps }, doc, fs (+16 more)

### Community 17 - "Musica del video"
Cohesion: 0.10
Nodes (22): addInto(), applyFader(), cache(), cached(), ducked, faderCurve(), KW, log() (+14 more)

### Community 18 - "Pruebas del backend"
Cohesion: 0.08
Nodes (4): _sent_payload(), test_robot_call_contacto_con_mensaje_fijo_lo_dice_en_vez_del_saludo(), test_robot_call_contacto_llama_a_su_numero_con_texto_neutro_y_el_mensaje(), test_robot_call_sin_contacto_llama_a_LUMINA_CALL_TO()

### Community 19 - "Escena Aether (video)"
Cohesion: 0.14
Nodes (20): LiveStage(), Aether(), AetherProps, CallPreview(), CallProps, Cues, Rehearsal(), tc() (+12 more)

### Community 20 - "Utilidades Lumina escritorio"
Cohesion: 0.10
Nodes (27): _abort_power(), _clip_read(), _clip_write(), _clock(), _forget(), _git_status(), _holo(), _lock_screen() (+19 more)

### Community 21 - "Generador del documento maestro"
Cohesion: 0.10
Nodes (24): borders, cell(), children, code(), dataRows(), doc, {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
  AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType,
  BorderStyle, PageNumber, ShadingType, VerticalAlign, LevelFormat, PageBreak,
}, ESP32 (+16 more)

### Community 22 - "Pruebas del dataset"
Cohesion: 0.10
Nodes (13): _fake_run(), runner(), _jpeg(), _ready_dataset(), test_bandeja_se_reparte_sola(), test_save_sample_rechaza_la_misma_foto(), test_snapshot_acepta_etiqueta_con_bom(), test_snapshot_cuenta_fotos_por_pieza() (+5 more)

### Community 23 - "Endpoints de la API"
Cohesion: 0.08
Nodes (12): get_dataset(), get_inventory(), get_inventory_history(), get_recent_perception_detections(), health(), line_cell_session(), line_vision_stream(), perception_stream() (+4 more)

### Community 24 - "Conversacion con Lumina"
Cohesion: 0.12
Nodes (25): askLumina(), chooseExpressionForAnswer(), deactivateRobot(), enterConversationMode(), getAudioContext(), greetBootWake(), handleVoiceCommand(), heardCallCommand() (+17 more)

### Community 25 - "Pruebas de Lumina escritorio"
Cohesion: 0.08
Nodes (18): test_artista_parecido(), test_asistente(), test_cierra_pide_confirmacion(), test_comandos_utiles(), test_cuerpo_vacio_de_spotify(), test_elige_telefono(), test_ensayo_apa(), test_ensayo_espera_el_aviso() (+10 more)

### Community 26 - "Glifos y primitivas"
Cohesion: 0.16
Nodes (20): BarcodeGlyph(), ChipGlyph(), G, Glyph(), LensGlyph(), LocateGlyph(), RecordGlyph(), SignalGlyph() (+12 more)

### Community 27 - "Analisis del video"
Cohesion: 0.12
Nodes (20): byIdx(), captured, comparison, ffDuration(), FFMPEG, FFPROBE, guion, LINES (+12 more)

### Community 28 - "Instrumentacion e2e"
Cohesion: 0.10
Nodes (18): instrument(), abs, before, errs, heard, l30, leadOf, LINES (+10 more)

### Community 29 - "Sesion de celda y dataset (API)"
Cohesion: 0.11
Nodes (16): essay_mark_ready(), _cell_payload(), _cell_who(), CellRunBody, DatasetBox, DatasetClassRequest, DatasetSampleRequest, line_cell_ack() (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (20): Aether Inventory station (collects finished piece, pending hardware), KUKA KR6 station (places piece on conveyor, pending hardware), Dashboard manufacturing line screenshot (4 stations, vision no signal), UR5 station (assembles via pre-programmed trajectories, pending hardware), Vision station (binary assembled yes/no confirmation, inactive), M.01 Percepcion (YOLO + barcode/QR, working), M.02 Inventory Engine (Observations vs Declared Inventory, working), M.03 Backend + Dashboard (read-only REST API, 25 active entries, working) (+12 more)

### Community 31 - "Community 31"
Cohesion: 0.20
Nodes (19): CallEvent, CallScreen(), CONTACT, LINK, LUMINA, mmss(), STATUS, Aperture() (+11 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (20): _access_token(), _api(), _best_track(), _devices(), _ensure_device(), _is_phone(), _json_or_empty(), _launch_spotify_app() (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.14
Nodes (19): Fase 0 ADR 0001-0008 decisions, ArUco position verification (not navigation), FastAPI backend + SQLite (4 endpoints), MQTT telemetry + REST + hardware-watchdog safety stop, Jetson Orin Nano Super edge compute (Pi 5 contingency), Dashboard (static, read-only, industrial dark tech), Observations vs Declared Inventory schema, Peer-to-peer handshake protocol (no central orchestrator) (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (15): chromeVersion, outDir, [profile = "none", runsArg = "1", lane = "0"], PROFILES, RUNS, rows, SCENES, server (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (12): [out, url = "ws://127.0.0.1:8000/show/ws"], ws, log(), OUT, port, root, TYPES, [comp = "AetherEnsayo", ...specs] (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (19): _allowed_roots(), _blocked_name(), _compare_files(), _docx_text(), _find_user_file(), _is_under(), _mkdir(), _mkfile() (+11 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (10): aggregate(), _group_key(), _location_key(), _observation(), test_agrupa_observations_con_mismo_code_data(), test_avg_confidence_es_el_promedio_correcto(), test_code_read_count_solo_cuenta_observations_con_code_read_true(), test_first_seen_y_last_seen_correctos_con_observations_desordenadas() (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (12): base_weights(), collect_samples(), DatasetError, main(), map50_from_results_csv(), publish_if_better(), read_class_names(), read_report() (+4 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (17): borders, callout(), cell(), doc, {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
  PageNumber, ShadingType, VerticalAlign, LevelFormat, PageBreak,
}, FIG, fs, h() (+9 more)

### Community 40 - "Community 40"
Cohesion: 0.11
Nodes (4): C, {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, PageBreak, TableOfContents, Header, Footer, PageNumber,
  VerticalAlign, LevelFormat, convertInchesToTwip, ExternalHyperlink,
}, fs, path

### Community 41 - "Community 41"
Cohesion: 0.11
Nodes (17): description, license, name, private, repository, sideEffects, version, eslint (+9 more)

### Community 42 - "Community 42"
Cohesion: 0.14
Nodes (15): activeCount(), canvas, ctx, grid, loop(), NODE_A, NODE_B, nodes (+7 more)

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (14): _ask(), client(), _fake_ollama(), test_503_si_ollama_no_contesta(), test_descarta_la_oracion_incompleta_del_final(), test_devuelve_la_respuesta_de_ollama(), test_listas_se_reemplazan_por_respuesta_honesta(), test_pregunta_fuera_de_la_lista_va_a_ollama() (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.26
Nodes (15): Word(), actAlpha(), clamp01(), EASE, fired(), prog(), since(), track() (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.13
Nodes (12): _apa_p(), _cover_drawing(), _cover_png(), _essay_blocks(), _essay_html(), _essay_plain(), _essay_slug(), _is_banned() (+4 more)

### Community 46 - "Community 46"
Cohesion: 0.13
Nodes (6): _celda_no_cache(), _refresh_begin_capture(), _refresh_end_capture(), _refresh_run_pipeline_step(), _refresh_sink(), _resolve_edge_python()

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (13): Api, host, Live(), Window, CallState, HeroWordmark(), LOOP, pointer (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.12
Nodes (17): scripts, build, call:build, dev, levels, lint, music, phase0:analyze (+9 more)

### Community 49 - "Community 49"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, moduleResolution (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.16
Nodes (7): ask_lumina(), AskRequest, _clean_llm_answer(), _is_meta_commentary(), _looks_like_list(), _match_preloaded_answer(), _split_into_sentences()

### Community 51 - "Community 51"
Cohesion: 0.15
Nodes (13): f(), diffs, e(), mixes, out, perLine, rms(), s() (+5 more)

### Community 52 - "Community 52"
Cohesion: 0.19
Nodes (8): clasificar_pieza(), _draw_deteccion(), process(), entorno(), juntar(), main(), pedir(), trocear()

### Community 53 - "Community 53"
Cohesion: 0.19
Nodes (3): Base, DeclaredEntry, DeclaredEntryHistory

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (15): Placeholder demo grabada vision de linea (linea.mp4 pendiente), Placeholder demo grabada percepcion (percepcion.mp4 pendiente), Banda transportadora (Q0.1) y cajon de scrap, Camara + Raspberry vision de linea (USB), IR1 infrarrojo 1 (pieza en estacion, I0.0), IR2 infrarrojo 2 (la pieza siguio?, I0.1), Piston empuja pieza fuera de la banda (Q0.0), Tablero PLC dueno de banda y piston (+7 more)

### Community 55 - "Community 55"
Cohesion: 0.15
Nodes (12): attemptConnection(), fullscreenBtn, label, loadingEl, loadingText, placeholderEl, placeholderText, showConnecting() (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.16
Nodes (11): Honestidad: expresiones predefinidas, LLM local Ollama, Stack Learning from Demonstration hipotetico, Banner superado por ADR 0008, 8b programacion nativa KUKA/UR5, 8a handshake hibrido + registro pasivo MQTT, UR5 sin LfD, trayectorias fijas, 8c verificacion binaria en PC fija, Banda + fixtures + vision + piston (+3 more)

### Community 57 - "Community 57"
Cohesion: 0.14
Nodes (15): Figura: Lo que el programa abre (camaras), Pines GPIO no se usan (main.py no lee pines), LINE_VISION_CAMERA_INDEX=0 (/dev/video0, puerto 8000 /line/vision/stream), PERCEPTION_CAMERA_INDEX=0 (segunda Raspberry, /perception/stream), Figura: Sensores se montan, el programa no los lee, Sensores IR1 e IR2 sin borne en el codigo, plc_backend vacio; numeros de la celda simulados, Figura: Aether - que se conecta con que (+7 more)

### Community 58 - "Community 58"
Cohesion: 0.14
Nodes (13): Aether interface design system, Key components (site-nav, btn, module-card, camera-placeholder, retire-dialog), Micro-interaction :active convention, 3D node field persistent background (node-field.js), Reticle corners visual signature, Design tokens (bg, ink, line, accent #6E8CFF, positive, warn), Three-font typography (Big Shoulders, IBM Plex Sans, IBM Plex Mono), Aether (parent project Lumina was extracted from) (+5 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (13): headerCell(), statusCell(), altRows, altTable(), B, capitulo2, componentTable(), compRows (+5 more)

### Community 60 - "Community 60"
Cohesion: 0.14
Nodes (10): ACTS, camera, CLICKS, cues, end, guion, KEY_WORD_END_MS, pausesMs (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.14
Nodes (11): Motor battery with fuse and emergency stop before driver, Display with its own supply, micro HDMI, Robot power diagram: three sources, 27 W USB-C 5 V supply powers Pi 5 and ESP32, Encoders 3.3 V on input-only GPIO 34/35/36/39, ESP32 to TB6612 pin map (PWMA/B, AIN, BIN, STBY), Robot signal wiring diagram, Pi 5 UART (GPIO14/15) to ESP32 GPIO16/17, USB camera and lidar (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.18
Nodes (13): Aether Inventory mobile robot, FastAPI backend, Dashboard (index.html, inventory.html), Honesty principle: report only hardware-verified capabilities, Inventory Engine / Declared Inventory, KUKA KR6 arm places parts on conveyor, Complete automotive manufacturing line, Peer-to-peer handshake protocol between stations (+5 more)

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (10): tocLine(), code(), doc, {
  Document, Packer, Paragraph, TextRun, ImageRun, Footer,
  AlignmentType, PageNumber, BorderStyle, PageBreak,
}, FIG, fs, OUT, p() (+2 more)

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (13): LUMINA_PATTERN regex y debounce 600 ms, Pagina prueba de reconocimiento de Lumina, Plantilla de introduccion Fase 0 (placeholder DONDE), Latencias por perfil de red, mp3 de referencia vs voz real, Fase 0 REPORT tiempos reales de Lumina, Corrida real e2e: mediana +3 ms, p95 75 ms, Lo que no se pudo verificar (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.19
Nodes (12): Brackets(), MECH, Box, BOXES, boxPath(), D, Drawn(), Observacion() (+4 more)

### Community 66 - "Community 66"
Cohesion: 0.28
Nodes (4): main(), main(), run_step(), _venv_python()

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (13): activateRobot(), attemptCameraConnection(), connectShowChannel(), emitShowEvent(), formatDetectionLine(), pollDetections(), resolveLuminaWait(), runPresentationScript() (+5 more)

### Community 68 - "Community 68"
Cohesion: 0.18
Nodes (12): Reproductor index.html (carga dist/player.js), Clicker del expositor, aether-video README, Montaje en escenario con equipos distintos, timeline.json fuente de verdad de cues, Relevo WebSocket /show/ws robot a video, Video clicker ?clicker=1, Lumina escritorio sin LLM (regex, lumina_desktop.py) (+4 more)

### Community 69 - "Community 69"
Cohesion: 0.26
Nodes (10): loopNoise(), Cierre(), HEX, lerpAngle(), MARKS, marksPaths(), Link(), NODES (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.17
Nodes (7): ask_robot(), _clean_llm_answer(), _is_meta_commentary(), _looks_like_list(), _match_preloaded_answer(), RobotAskRequest, _split_into_sentences()

### Community 71 - "Community 71"
Cohesion: 0.18
Nodes (7): _call_text(), _contact_key(), _load_contacts(), robot_call(), robot_contacts(), RobotCallRequest, _valid_contacts()

### Community 72 - "Community 72"
Cohesion: 0.27
Nodes (12): begin(), box(), caster(), cyl(), hubMotor(), M(), makeGuide(), makeLabel() (+4 more)

### Community 73 - "Community 73"
Cohesion: 0.23
Nodes (12): El laboratorio no sale a internet, Lista de verificacion de router, UPnP, firewall y MQTT, Opciones sin abrir puertos: Cloudflare Tunnel + Access o Tailscale, Reporte de endurecimiento de aethermx.online, Pendientes manuales en Cloudflare, Riesgos que se quedan (HSTS, unsafe-inline, rate limit), Runbook manual: Cloudflare delante de GitHub Pages, Conflicto renovacion certificado GitHub con nube naranja (+4 more)

### Community 74 - "Community 74"
Cohesion: 0.17
Nodes (11): _fake_ollama_response(), test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar(), test_robot_ask_descarta_la_oracion_incompleta_del_final(), test_robot_ask_devuelve_la_respuesta_de_ollama(), test_robot_ask_lista_con_guiones_se_reemplaza_por_respuesta_honesta(), test_robot_ask_lista_numerada_tambien_se_detecta(), test_robot_ask_pregunta_fuera_de_la_lista_sigue_yendo_a_ollama(), test_robot_ask_quita_solo_la_oracion_de_metacomentario() (+3 more)

### Community 75 - "Community 75"
Cohesion: 0.23
Nodes (9): _make_entry(), _make_history_row(), _seed(), test_history_ordenado_por_recorded_at_descendente(), test_inventory_devuelve_solo_activas_por_defecto(), test_inventory_include_retired_incluye_tambien_las_retiradas(), test_producto_retirado_sigue_apareciendo_con_include_retired(), test_retire_con_password_correcta_cambia_status_y_responde_200() (+1 more)

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (11): ADRs 1-10 (8 superada por 10), Cambio de brazos KUKA/UR5 a banda+fixtures+piston, Proceso de cambio y registro 2026-09-16, Reglas para Claude Code, Decision 9 auto-refresh de Declared Inventory, Estructura de carpetas propuesta, Decisiones 1-8 de Fase 0, Contexto maestro de Aether para Claude Code (+3 more)

### Community 77 - "Community 77"
Cohesion: 0.20
Nodes (11): Glosario nunca decir / decir en su lugar, Problemas conocidos (cache, microfono, redeclaracion), Redisenho OLED sci-fi de Lumina (robot.html/js), ActFinal - Documento maestro (2026-09-17), 4 principios no negociables, 11 endpoints reales de backend/main.py, Arbol generado del repo (desactualizado), Sistema de diseno del informe (colores, fuentes) (+3 more)

### Community 78 - "Community 78"
Cohesion: 0.18
Nodes (11): dependencies, react, react-dom, remotion, @remotion/bundler, @remotion/cli, @remotion/google-fonts, @remotion/noise (+3 more)

### Community 79 - "Community 79"
Cohesion: 0.20
Nodes (10): _ask(), handle_desktop(), _mcp_body(), _n8n_args(), _n8n_call(), _n8n_post(), _n8n_tools(), _n8n_try() (+2 more)

### Community 80 - "Community 80"
Cohesion: 0.22
Nodes (7): _get_parts_model(), _get_yolo_model(), _load_yolo(), _make_line_vision_processor(), _make_perception_processor(), process(), _notify_perception_observation_sinks()

### Community 81 - "Community 81"
Cohesion: 0.20
Nodes (8): Demos grabadas percepcion.mp4 y linea.mp4, Seccion Alianzas y patrocinio, CSP y Permissions-Policy, Vista explosionada del carrito, Linea de manufactura banda-vision-piston, Vista en vivo de percepcion, Simulacion funcionamiento, Loader global y vista explosionada 2026-09-30

### Community 82 - "Community 82"
Cohesion: 0.20
Nodes (11): applyExpression(), arcPath(), browPath(), capsulePath(), circlePath(), currentBaseMouthShape(), eyePath(), livelinessFrame() (+3 more)

### Community 83 - "Community 83"
Cohesion: 0.22
Nodes (10): Pantalla de la celda (celda.html) y modo SIM, CELL_AGENT_URL y endpoints /vision/stream, /cell/snapshot, /line/vision/stream, /line/cell/status, Hoja de conexion de la celda de manufactura (Aether), Sensores infrarrojos IR1 e IR2 (24 V, 3 hilos), Orden de puesta en marcha (10 pasos), Piston de rechazo, PLC (reloj de la celda, banda y piston), Raspberry Pi (ojo de la celda, camara USB) (+2 more)

### Community 84 - "Community 84"
Cohesion: 0.20
Nodes (11): applyExpression(), arcPath(), browPath(), capsulePath(), circlePath(), currentBaseMouthShape(), eyePath(), livelinessFrame() (+3 more)

### Community 85 - "Community 85"
Cohesion: 0.20
Nodes (10): devDependencies, esbuild, eslint, playwright-core, prettier, @remotion/eslint-config-flat, @types/react, @types/react-dom (+2 more)

### Community 86 - "Community 86"
Cohesion: 0.20
Nodes (3): init_db(), lifespan(), no_cache()

### Community 87 - "Community 87"
Cohesion: 0.22
Nodes (7): Lumina proyeccion 3D, Modelos aether/agua/metano/placa, Autocomprobacion de perspectiva de camara, Pantalla de espera por voz, Pantalla de llamada Remotion, Lumina robot cara y voz, Pantallas de laboratorio no publicadas

### Community 88 - "Community 88"
Cohesion: 0.20
Nodes (7): Hoja de ruta hecho/pendiente, Modos Conversacion vs Camara excluyentes, Jetson Orin Nano Super, contingencia Pi 5, ESP32/STM32, MQTT telemetria, REST dashboard, watchdog hardware, 10b PLC vs ESP32/STM32 pendiente, Pendientes bloqueados por hardware (PLC/MCU, piston, Jetson), Pendientes no bloqueados (PASS/FAIL real, clasificador 1/2/3)

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (10): cancelPendingConversation(), hideCaptionSoon(), mouthBoundaryBurst(), pauseRecognitionForSpeech(), randomizeMouthBandTargets(), resumeRecognitionAfterSpeech(), speak(), speakBrowser() (+2 more)

### Community 90 - "Community 90"
Cohesion: 0.38
Nodes (10): askLumina(), chooseExpressionForAnswer(), enterConversationMode(), handleVoiceCommand(), queueVoiceFragment(), restingExpression(), runPresentationScript(), setFaceExpression() (+2 more)

### Community 91 - "Community 91"
Cohesion: 0.31
Nodes (9): Dataset de piezas y umbrales 0.25/0.50/0.10, Contrato entre lo visto y lo declarado, Acciones de escritorio y confirmaciones de Lumina, Orden de resolucion de Lumina: escritorio, precargada, Ollama, Lo que no se puede afirmar, Observacion cruda vs inventario declarado (agregacion pura), Video de presentacion Remotion (11 escenas), AETHER_DICTADO (narracion de 26 escalones) (+1 more)

### Community 92 - "Community 92"
Cohesion: 0.22
Nodes (8): dependencies, docx, docx, name, private, scripts, build, version

### Community 93 - "Community 93"
Cohesion: 0.25
Nodes (7): auth_url(), _b64_auth(), _creds(), exchange_code(), _spotify_login(), start_callback_server(), do_GET()

### Community 94 - "Community 94"
Cohesion: 0.22
Nodes (7): _essay_kind(), _essay_topic(), _is_essay_status(), parse_intent(), _site(), _split_track(), _strip()

### Community 95 - "Community 95"
Cohesion: 0.22
Nodes (5): AutoRefreshStartRequest, get_inventory_auto_refresh_status(), _refresh_status_payload(), start_inventory_auto_refresh(), stop_inventory_auto_refresh()

### Community 96 - "Community 96"
Cohesion: 0.31
Nodes (4): paint(), paintAlarms(), pull(), setRun()

### Community 97 - "Community 97"
Cohesion: 0.22
Nodes (7): Tabla de decisiones Fase 0, Arquitectura conceptual Robot a Dashboard, Reglas para Claude y regla de cambios, Banner superado por aether_context_docs.md, Aether Inventory vision inicial, Hibrido YOLO + codigo de barras/QR, Conteo visible detectado distinto de conteo real

### Community 98 - "Community 98"
Cohesion: 0.22
Nodes (7): Modulos M.01-M.05, Captura continua de esta camara, Aviso de cobertura no disponible, Tabla Declared Inventory, Bitacora de inspecciones, Dialogo retirar producto con contrasena, Reuso de CameraPublisher

### Community 100 - "Community 100"
Cohesion: 0.28
Nodes (7): Boot screen with hidden button, Face SVG (eyes, brows, pupils, mouth, thinking dots, listening rings), lumina.css, Lumina web interface page (index.html), lerpColor(), project(), renderFrame()

### Community 101 - "Community 101"
Cohesion: 0.29
Nodes (8): Servicios y rutas del backend, Backend + dashboard :8000, lumina-agent standalone :8000, Ollama :11434, URLS_Y_COMANDOS tabla de URLs y comandos, Remotion Studio :3000, Estado de verificacion 30 sep 2026, Reproductor de video :5055

### Community 102 - "Community 102"
Cohesion: 0.25
Nodes (6): B, capitulo3, epRows, FOLDER_TREE, fs, path

### Community 103 - "Community 103"
Cohesion: 0.46
Nodes (6): emit(), hidden(), postFrames(), quality(), register(), watch()

### Community 104 - "Community 104"
Cohesion: 0.29
Nodes (5): Observations vs Declared Inventory, Estados PARTIAL COMPLETE INVALID, Opcion B inventario + historial, Opcion C monitoreo en vivo diferida, Loop de auto-refresh en backend con polling

### Community 105 - "Community 105"
Cohesion: 0.33
Nodes (7): Simulador de celda (164 s, marca sim), Cableado de celda Pi/PLC/IR y mapa Modbus de ejemplo, Evento A Vision a Actuador, Evento B Actuador a line_events_listener (3 acciones), Pendiente: PLC vs MCU, transporte, topico, Protocolo de handshake de la linea, Topicos MQTT pendientes de definicion

### Community 106 - "Community 106"
Cohesion: 0.29
Nodes (7): Aether hexagon logo with node network (violet), Aether report cover page (PNG), Aether report cover page (SVG source), Team 9IME1M, Universidad Tecnologica de Chihuahua Sur, professor Jesus Fernando Rivera Soto, Aether dashboard hero screenshot (real), Status pill: Percepcion, Inventory Engine, Backend funcionando, Demo overlay frame (white screen area with corner brackets on black)

### Community 107 - "Community 107"
Cohesion: 0.29
Nodes (7): Aether Inventory (picks up and transports finished part), KUKA KR6 (places part on conveyor), Vision de linea (binary assembly confirmation), Listener MQTT (records events as Observation, controls nothing), UR5 (assembles with pre-programmed trajectories), Inspection log (Bitacora de inspecciones) screenshot, Declared Inventory table screenshot

### Community 108 - "Community 108"
Cohesion: 0.29
Nodes (4): CellLoginBody, line_cell_login(), line_cell_logout(), robot_essay()

### Community 109 - "Community 109"
Cohesion: 0.43
Nodes (6): Panel de alarmas, Celda 01 HMI, KPIs PASS/FAIL produccion, CAM 01 vision de linea, Pantalla de login HMI, Arranque/Paro ciclo completo

### Community 110 - "Community 110"
Cohesion: 0.38
Nodes (4): attemptConnection(), showConnecting(), startStream(), ADR-0010

### Community 111 - "Community 111"
Cohesion: 0.33
Nodes (6): Figura 03: Cableado de sensores IR y bornera del PLC, Sensor infrarrojo 3 hilos (marron, azul, negro), Bornera del PLC: +24V, 0V, I0.0 (IR1), I0.1 (IR2), Q0.0 (rele piston), Figura 04: Secuencia de inspeccion y resultados de IR2, Resultados IR2: pieza aceptada, scrap expulsado, fallo de actuacion, parar y alarmar, Secuencia en 5 pasos: pieza llega, foto, juicio, piston, IR2 confirma

### Community 112 - "Community 112"
Cohesion: 0.33
Nodes (7): Carrito Aether - guia de ensamble 3D (Three.js), Apartados: estructura, cubiertas, traccion, torre, electronica, arnes, Orden de cableado: bateria, XT60, fusible, T90, elevador 18 V, M0601, RS485, Electronica del carrito: ESP32, Jetson Orin Nano, MAX485, camara, Paro LAY37 en serie con bobina del relevador, Torre: husillos T8, NEMA 17, fixtures, empujador, A4988, _dump.html (volcado de carrito-explode con codificacion corrupta)

### Community 113 - "Community 113"
Cohesion: 0.29
Nodes (7): mouthBoundaryBurst(), pauseRecognitionForSpeech(), randomizeMouthBandTargets(), resumeRecognitionAfterSpeech(), speak(), startTalkingAnimation(), stopTalkingAnimation()

### Community 114 - "Community 114"
Cohesion: 0.40
Nodes (6): Aether Logo Cover (dark, PNG), Hexagonal node lattice mark (sensor/inspection nodes), Aether Logo Cover (dark, SVG), AETHER INDUSTRIAL SYSTEMS wordmark (Bebas Neue / IBM Plex Mono, violet #5B4FE8 palette), Aether Logo Mono (light, PNG), Aether Logo Mono (light, SVG)

### Community 115 - "Community 115"
Cohesion: 0.33
Nodes (5): $comment, properties, $schema, title, type

### Community 116 - "Community 116"
Cohesion: 0.40
Nodes (6): callPause(), closeCallScreen(), openCallScreen(), placeCall(), setCallScreen(), showCaption()

### Community 117 - "Community 117"
Cohesion: 0.33
Nodes (4): ArUco para verificacion de posicion, ArUco no es navegacion, Waypoints + odometria de encoders, Deteccion reactiva no evasion inteligente

### Community 118 - "Community 118"
Cohesion: 0.47
Nodes (6): Figura 05: Pantalla celda.html (video, juicio, contadores), Endpoints /line/vision/stream y /line/cell/status, Figura 06: Topologia de red laptop, Raspberry, PLC via switch, Laptop 192.168.0.10 puerto 8000, PLC 192.168.0.30 Modbus puerto 502, Raspberry 192.168.0.20 puerto 8080

### Community 120 - "Community 120"
Cohesion: 0.33
Nodes (3): client(), _fake_zavu_response(), zavu()

### Community 122 - "Community 122"
Cohesion: 0.40
Nodes (5): _allow(), _allowed_app(), _close_app(), _find_lnk(), _open_app()

### Community 124 - "Community 124"
Cohesion: 0.70
Nodes (4): askRead(), kick(), readLayout(), write()

### Community 125 - "Community 125"
Cohesion: 0.70
Nodes (4): frame(), kick(), render(), setStage()

### Community 126 - "Community 126"
Cohesion: 0.70
Nodes (4): finish(), render(), settleRobot(), track()

### Community 128 - "Community 128"
Cohesion: 0.60
Nodes (5): applyEssayStatus(), setEssayWorking(), startEssayWatch(), syncEssayStatus(), warnEssayPaste()

### Community 129 - "Community 129"
Cohesion: 0.60
Nodes (3): cuerpos(), limpiar_cierre_de_alcance(), main()

### Community 130 - "Community 130"
Cohesion: 0.50
Nodes (4): Principios 4.1-4.5, backend README entorno venv, requirements-dev: ruff, pytest, httpx, requirements: fastapi, uvicorn, sqlalchemy, opencv, ultralytics, pyzbar, dotenv

### Community 131 - "Community 131"
Cohesion: 0.50
Nodes (3): Anotacion de fotos con cajas, Dataset de piezas YOLO, Modelo activo parts.pt / yolov8n.pt

### Community 134 - "Community 134"
Cohesion: 0.67
Nodes (4): Backend uvicorn main:app port 8000 and /line/vision/stream, Montaje de manana (Raspberry, sensores, vision), Raspberry camera device check (ls /dev/video*, video0/video1 variable), IR1 (before camera) and IR2 (after piston) sensors; not wired to Raspberry header; I0.0 numbers were only an example

### Community 135 - "Community 135"
Cohesion: 0.50
Nodes (3): dependencies, docx, docx

### Community 136 - "Community 136"
Cohesion: 0.67
Nodes (3): ArUco position verification, Hybrid perception (YOLO + barcode/QR), NVIDIA Jetson Orin Nano Super edge computing

### Community 139 - "Community 139"
Cohesion: 1.00
Nodes (3): _battery_percent(), _watch_battery(), check()

### Community 143 - "Community 143"
Cohesion: 0.67
Nodes (3): apply(), select(), showList()

### Community 144 - "Community 144"
Cohesion: 0.67
Nodes (3): getAudioContext(), playExpressionSound(), playTone()

## Knowledge Gaps
- **170 isolated node(s):** `@remotion/paths`, `@types/react`, `@types/react-dom`, `@types/web`, `eslint` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 984 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 47` to `Motor de audio (engine.js)`, `Community 65`, `Community 69`, `Community 41`, `Community 44`, `Demo overlay (video)`, `Escena Aether (video)`, `Glifos y primitivas`, `Community 31`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `@remotion/paths`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Motor de audio (engine.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Community 48` to `Community 41`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Should `Robot Lumina (UI)` be split into smaller, more focused modules?**
  _Cohesion score 0.03506721215663355 - nodes in this community are weakly interconnected._
- **Should `Criterios de aceptacion MVP` be split into smaller, more focused modules?**
  _Cohesion score 0.05451127819548872 - nodes in this community are weakly interconnected._
- **Should `Publicador de camara` be split into smaller, more focused modules?**
  _Cohesion score 0.05101327742837177 - nodes in this community are weakly interconnected._