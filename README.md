# CASE STUDY 2
Dưới đây là một chương trình có nhiệm vụ chuyển file ảnh tiếng Anh sang một file `pdf` tiếng Việt. Các bước xử lý lần lượt bao gồm: chuyển đổi ảnh sang text, dịch tiếng Anh sang tiếng Việt, chuyển đổi nội dung text thành file `pdf`. Chương trình chính chỉ demo các tính năng này tuần tự.

## Hướng dẫn cài đặt
Yêu cầu cài đặt trước [tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) trên hệ điều hành của bạn. 
Cài đặt [Erlang](https://www.erlang.org/downloads) và [RabbitMQ](https://www.rabbitmq.com/docs/install-windows) trước khi chạy 

```sh
# Cài đặt các gói liên quan
$ npm install
$ npm i archiver
$ npm install amqplib
# Tạo folder cho output
$ mkdir output
# Khởi chạy ứng dụng demo
$ npm start/node server.js
```

## Mô Tả
| File | Chức năng |
|--|:--|
| utils/ocr.js | Chuyển đổi ảnh sang text |
| utils/translate.js | Dịch tiếng Anh sang tiếng Việt |
| utils/pdf.js | Chuyển đổi text sang PDF |
| Routes |
|--|:--|
| Message Queue (queue) |
|--|:--|
| Pipes and Filters |
|--|:--|
| Client (public) |
| Server (server.js) |

## Giải pháp đã sử dụng
 - Sử dụng `express.js` cho phép upload một file ảnh và trả về một file `pdf` tương ứng
 - Sử dụng `Pipes and Filters pattern` và `message queue` để hoàn thiện chương trình
 - [Queue-Based Load Leveling pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)
 - [Competing Consumers pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers)
