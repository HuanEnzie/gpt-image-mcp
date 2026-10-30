---
name: gpt
description: Dùng các mô hình GPT (chat/suy luận và tạo ảnh gpt-image-2) qua ChatGPT đã đăng nhập sẵn trên máy, thông qua proxy openai-oauth. Gọi khi người dùng muốn "dùng GPT", "tạo ảnh bằng GPT", hoặc nhờ GPT làm một việc.
---

# Skill GPT (openai-oauth)

Proxy cục bộ dùng phiên đăng nhập ChatGPT/Codex có sẵn trên máy, mở endpoint tương thích OpenAI. Không cần API key.

- Base URL: `http://127.0.0.1:10531/v1`
- Model đã xác nhận (2026-10-03): `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-image-2`. Danh sách có thể đổi, chạy lại lệnh start để xem.
- Đã test thành công: `/v1/chat/completions` (gpt-5.5), `/v1/responses` (gpt-5.5), `/v1/images/generations` (gpt-image-2).

## Bước 1: bảo đảm server đang chạy

Kiểm tra: `Invoke-RestMethod http://127.0.0.1:10531/v1/models`. Nếu lỗi kết nối, khởi động:

```
npx -y -p openai-oauth -p zod openai-oauth --detach
```

(Phải thêm `-p zod`, nếu không `npx openai-oauth` báo thiếu package `zod`.)
Dừng: `npx openai-oauth stop`. Log: `npx openai-oauth logs --follow`.
Nếu báo chưa đăng nhập, bảo người dùng tự đăng nhập ChatGPT/Codex; không được tự nhập mật khẩu.

## Bước 2: gọi model

Chat / suy luận (PowerShell):
```powershell
$b=@{model="gpt-5.5";messages=@(@{role="user";content="..."})}|ConvertTo-Json -Depth 4
(Invoke-RestMethod http://127.0.0.1:10531/v1/chat/completions -Method Post -ContentType "application/json" -Body $b -TimeoutSec 120).choices[0].message.content
```
Dùng `/v1/responses` với `input` nếu cần API Responses. Model suy luận tốn token ẩn (reasoning), nên đừng đặt giới hạn token quá thấp.

Tạo ảnh: dùng script kèm theo:
```
powershell -File "C:\Users\Acer\.claude\skills\gpt\gen-image.ps1" -Prompt "..." -Out "E:\path\anh.png" [-Size 1024x1024]
```
Sau đó dùng Read để xem ảnh và kiểm tra kết quả.

## Lưu ý đã quan sát

- Ảnh trả về dạng `b64_json` (PNG), có metadata C2PA. Kích thước thực tế có thể lệch so với `size` yêu cầu (yêu cầu 1024, ra ~1254).
- Model ảnh hay tự thêm chữ tiếng Anh vào ảnh. Nếu không muốn chữ, ghi rõ trong prompt: "no text, no letters, no watermark". Nếu cần chữ tiếng Việt, ghi chính xác chuỗi cần hiển thị và kiểm tra lại dấu.
- Tạo ảnh mất vài chục giây, đặt timeout >= 280s.
- Dùng hạn mức của tài khoản ChatGPT của người dùng: không gọi hàng loạt nếu chưa hỏi.
- Endpoint chỉ nghe trên 127.0.0.1; không mở ra mạng ngoài.
- Dữ liệu gửi cho GPT đi ra dịch vụ bên ngoài: không gửi bí mật/khoá API/dữ liệu cá nhân của người dùng.

## Cách phối hợp

- Việc cần sáng tạo ảnh: viết prompt tiếng Anh chi tiết (chủ thể, bối cảnh, ánh sáng, phong cách, tỉ lệ, "no text"), sinh ảnh, xem lại, chỉnh prompt nếu lệch.
- Việc cần ý kiến thứ hai hoặc so sánh: gọi model GPT mạnh nhất có trong danh sách và nêu rõ đây là đầu ra của GPT khi báo lại người dùng.
