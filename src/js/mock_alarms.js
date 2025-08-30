// src/js/mock_alarms.js
export const mockAlarms = [
  {
    camera_id: "cam360_001",
    error_detail: "Crowd density exceeded threshold (15 people)",
    img_error: "Error_example.jpeg", // Sử dụng key
    location: "factory_floor_1",
  },
  {
    camera_id: "cam360_001",
    error_detail: "Fire extinguisher blocked at exit_1",
    img_error: "Error_example2.jpeg",
    location: "exit_1",
  },
  {
    camera_id: "cam360_002",
    error_detail: "Air conditioner off, LED dark",
    img_error: "Error_example3.jpeg",
    location: "control_room_2",
  },
  {
    camera_id: "cam360_001",
    error_detail: "Sleep detection: worker001 inactive for 5min",
    img_error: "Error_example.jpeg",
    location: "assembly_line_3",
  },
  {
    camera_id: "cam360_003",
    error_detail: "Missing helmet at export dock",
    img_error: "Error_example2.jpeg",
    location: "export_dock_4",
  },
  {
    camera_id: "cam360_002",
    error_detail: "Walking way blocked by box in corridor_2",
    img_error: "Error_example3.jpeg",
    location: "corridor_2",
  },
];

export function getMockAlarm() {
  const randomIndex = Math.floor(Math.random() * mockAlarms.length);
  return { ...mockAlarms[randomIndex], id: `mock_${Date.now()}` };
}