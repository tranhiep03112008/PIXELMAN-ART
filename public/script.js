const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const cooldownMsg = document.getElementById("cooldownMsg");

const PIXEL_SIZE = 10; // tắng gấp đôi kích thước pixel
let canvasWidth, canvasHeight;

// Nhận canvas ban đầu
socket.on("init", (data) => {
  canvasHeight = data.length;
  canvasWidth = data[0].length;
  canvas.width = canvasWidth * PIXEL_SIZE;
  canvas.height = canvasHeight * PIXEL_SIZE;
  drawCanvas(data);
});

// Cập nhật pixel từ server
socket.on("updatePixel", ({ x, y, color }) => {
  drawPixel(x, y, color);
});

socket.on("cooldown", ({ timeLeft }) => {
  cooldownMsg.innerText = `⏳ Đợi ${timeLeft}s trước khi vẽ tiếp...`;
});

// Vẽ toàn bộ canvas
function drawCanvas(data) {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      drawPixel(x, y, data[y][x]);
    }
  }
}

// Vẽ một pixel
function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

// Sự kiện click chuột để đặt pixel
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
  const color = colorPicker.value;
  socket.emit("placePixel", { x, y, color });
});

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
  const pwd = prompt("Nhập mật khẩu để reset canvas:");
  if (pwd) {
    socket.emit("resetCanvas", { password: pwd });
  }
});
socket.on("resetFailed", (msg) => {
  alert(msg);
});