const net = require("net");
const { access, readFile, writeFile } = require("fs");
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
    console.log("close connection");
  });
  socket.on("data", (data) => {
    let path = data.toString().split(" ");
    let userAgent = data.toString().split("\r\n")[2].split(" ")[1];
    let method = path[0];
    if (method == "POST") {
      if (path[1].startsWith("/files")) {
        const requestContent = Buffer.from(data).toString();
        const header = requestContent.split("\r\n\r\n")[0];
        const bodyContent = requestContent.split("\r\n\r\n")[1];
        let fileName = header.split(" ")[1].substr(7);
        let filePath = process.argv[3];
        writeFile(filePath + fileName, bodyContent, (err) => {
          if (err) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.end();
          } else {
            socket.write("HTTP/1.1 201 OK\r\n\r\n");
            socket.end();
          }
        });
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      }
    } else {
      if (path[1] == "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        socket.end();
      } else if (path[1].startsWith("/echo")) {
        let info = path[1].substr(6);
        socket.write("HTTP/1.1 200 OK\r\n");
        socket.write("Content-Type: text/plain\r\n");
        socket.write(`Content-Length: ${info.length}\r\n\r\n`);
        socket.write(`${info}`);
        socket.end();
      } else if (path[1].startsWith("/user-agent")) {
        let userAgent = data.toString().split("\r\n")[2].split(" ")[1];
        socket.write("HTTP/1.1 200 OK\r\n");
        socket.write("Content-Type: text/plain\r\n");
        socket.write(`Content-Length: ${userAgent.length}\r\n\r\n`);
        socket.write(`${userAgent}`);
        socket.end();
      } else if (path[1].startsWith("/files")) {
        let fileName = path[1].substr(7);
        let filePath = process.argv[3];
        access(filePath + fileName, (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
              socket.end();
              return;
            }
            throw err;
          }
          readFile(filePath + fileName, "utf8", (err, data) => {
            if (err) {
              socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
              socket.end();
              return;
            }

            socket.write("HTTP/1.1 200 OK\r\n");
            socket.write("Content-Type: application/octet-stream\r\n");
            socket.write(`Content-Length: ${data.length}\r\n\r\n`);
            socket.write(`${data}`);
            socket.end();
          });
        });
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      }
    }
  });
  socket.on("connection", (conn) => {
    let c = 0;
    setInterval(function () {
      sock.write(c.toString() + " ");
      console.log(`connection ${c}\n`);
      c++;
    }, 1000);
  });
});
server.listen(4221, "localhost");
