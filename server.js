const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const lastPlaced = {};  // lưu thời điểm mỗi user đặt pixel gần nhất
const CANVAS_WIDTH = 100;   // số pixel ngang
const CANVAS_HEIGHT = 100;  // số pixel dọc
const canvas = Array.from({ length: CANVAS_HEIGHT }, () =>
  Array(CANVAS_WIDTH).fill("#ffffff") // canvas màu trắng ban đầu
);

app.use(express.static("public"));

const RESET_PASSWORD = "HiệpDZ"; // Mât khẩu để reset canvas

io.on("connection", (socket) => {
  console.log("Người dùng kết nối:", socket.id);
  socket.emit("init", canvas);

  socket.on("placePixel", ({ x, y, color }) => {
    const now = Date.now();
    const lastTime = lastPlaced[socket.id] || 0;

    if (now - lastTime < 5000) {  // 5 giây
      const timeLeft = ((5000 - (now - lastTime)) / 1000).toFixed(1);
      socket.emit("cooldown", { timeLeft });
      return;
    }

    if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
      canvas[y][x] = color;
      io.emit("updatePixel", { x, y, color });
      lastPlaced[socket.id] = now; // cập nhật thời gian đặt pixel
    }
  });
  
  socket.on("resetCanvas", ({ password }) => {
    if (password !== RESET_PASSWORD) {
      console.log(`Reset thất bại: Sai mật khẩu từ ${socket.id}`);
      socket.emit("resetFailed", "Sai mật khẩu!");
      return;
    }

    console.log(`Canvas được reset bởi: ${socket.id}`);
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        canvas[y][x] = "#ffffff";
      }
    }
    io.emit("init", canvas);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));