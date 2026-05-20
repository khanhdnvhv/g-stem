/* ================================================================ */
/*  DEVICE CATALOG — Dữ liệu chuẩn thiết bị STEM (Supplier)        */
/*  Shared source for DeviceCatalog page + STEMPackageConfigurator  */
/* ================================================================ */

export interface DeviceEntry {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  specs: string;
  unitPriceVND: number;
  inBomCount: number;
  active: boolean;
}

export const DEVICE_CATEGORIES = [
  "Robotic", "AI/ML Server", "IoT Kit",
  "Máy in 3D", "Cắt laser", "Drone", "VR/AR",
  "Hiển thị", "Điện tử", "Tài liệu",
] as const;

export const DEVICES: DeviceEntry[] = [
  { id: "DEV-001", sku: "GLX-BOT-MBOT2",     name: "mBot2 Robotic Kit",              category: "Robotic",      brand: "Makeblock",  specs: "Bluetooth, 5 sensors, AI camera module",         unitPriceVND: 4_500_000,  inBomCount: 2, active: true },
  { id: "DEV-002", sku: "GLX-BOT-SPIKE",     name: "LEGO SPIKE Prime Set",            category: "Robotic",      brand: "LEGO",       specs: "Python/Scratch, 6 motors, 45 pieces",            unitPriceVND: 12_500_000, inBomCount: 1, active: true },
  { id: "DEV-003", sku: "GLX-BOT-ARM6DOF",   name: "Cánh tay Robot giảng dạy 6DOF",  category: "Robotic",      brand: "Geleximco",  specs: "6 trục, payload 1 kg, ROS2 compatible",          unitPriceVND: 65_000_000, inBomCount: 1, active: true },
  { id: "DEV-004", sku: "GLX-GPU-RTX4060",   name: "Workstation GPU RTX 4060 Ti",    category: "AI/ML Server", brand: "NVIDIA/Dell", specs: "RTX 4060 Ti 16GB VRAM, RAM 32 GB, NVMe 1 TB",   unitPriceVND: 85_000_000, inBomCount: 1, active: true },
  { id: "DEV-005", sku: "GLX-IOT-ARD-ESP",   name: "Bộ IoT Starter Arduino+ESP32",   category: "IoT Kit",      brand: "Geleximco",  specs: "15 sensors, WiFi/BLE 5.0, breadboard + jumper",  unitPriceVND: 4_800_000,  inBomCount: 1, active: true },
  { id: "DEV-006", sku: "GLX-3DP-FDM-CRL",   name: "Máy in 3D FDM Creality EDU",    category: "Máy in 3D",    brand: "Creality",   specs: "220×220×250 mm, PLA/ABS/PETG, 250 mm/s",        unitPriceVND: 18_000_000, inBomCount: 1, active: true },
  { id: "DEV-007", sku: "GLX-3DP-RESIN-ELG", name: "Máy in 3D Resin Elegoo Saturn 3", category: "Máy in 3D",  brand: "Elegoo",     specs: "218×123×260 mm, 12K mono LCD",                   unitPriceVND: 27_000_000, inBomCount: 1, active: true },
  { id: "DEV-008", sku: "GLX-LASER-CO2-40W", name: "Máy cắt laser CO2 40W",          category: "Cắt laser",   brand: "Geleximco",  specs: "300×200 mm, CO2 40W, chống cháy tích hợp",      unitPriceVND: 75_000_000, inBomCount: 1, active: true },
  { id: "DEV-009", sku: "GLX-DRN-TELLO-EDU", name: "Drone giáo dục DJI Tello EDU",  category: "Drone",        brand: "DJI",        specs: "5MP camera, SDK Python/Swift, 13 phút bay",      unitPriceVND: 18_000_000, inBomCount: 1, active: true },
  { id: "DEV-010", sku: "GLX-VR-MQ3-128",    name: "Kính VR Meta Quest 3 128GB",    category: "VR/AR",        brand: "Meta",       specs: "4K+ display, 128 GB, standalone, mixed reality", unitPriceVND: 12_000_000, inBomCount: 1, active: true },
  { id: "DEV-011", sku: "GLX-IFP-86-4K",     name: "Smart Board Tương tác 86\"",    category: "Hiển thị",    brand: "Samsung",    specs: "4K UHD, 20-point touch, Android 13, HDMI×3",     unitPriceVND: 85_000_000, inBomCount: 1, active: true },
  { id: "DEV-012", sku: "GLX-TV-65-UHD",     name: "Smart TV Samsung 65\" UHD",     category: "Hiển thị",    brand: "Samsung",    specs: "4K, HDMI×4, Miracast, Tizen OS",                 unitPriceVND: 22_000_000, inBomCount: 1, active: true },
  { id: "DEV-013", sku: "GLX-MCU-ARD-UNO",   name: "Arduino Uno R3 Starter Kit",   category: "Điện tử",     brand: "Arduino",    specs: "Uno R3 + 30 modules cảm biến",                  unitPriceVND: 850_000,    inBomCount: 1, active: true },
  { id: "DEV-014", sku: "GLX-MCU-MBT-V2",    name: "BBC micro:bit v2 Pack (x5)",   category: "Điện tử",     brand: "BBC",        specs: "ARM Cortex-M4F, BLE 5.0, 5×5 LED, compass",     unitPriceVND: 680_000,    inBomCount: 1, active: true },
  { id: "DEV-015", sku: "GLX-DOC-GV-CT12",   name: "Giáo án CT1+CT2 đa bộ môn",   category: "Tài liệu",    brand: "Geleximco",  specs: "200 trang, PDF + Word, SGK mapping sẵn",         unitPriceVND: 5_000_000,  inBomCount: 2, active: true },
];
