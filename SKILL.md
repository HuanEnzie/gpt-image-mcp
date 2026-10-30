---
name: gpt
description: Dùng các mô hình GPT (chat/suy luận và tạo ảnh gpt-image-2) qua ChatGPT đã đăng nhập sẵn trên máy, thông qua proxy openai-oauth. Gọi khi người dùng muốn "dùng GPT", "tạo ảnh bằng GPT", hoặc nhờ GPT làm một việc.
---

# Skill GPT (openai-oauth)

Proxy cục bộ dùng phiên đăng nhập ChatGPT/Codex có sẵn trên máy, mở endpoint tương thích OpenAI. Không cần API key.

- Base URL: `http://127.0.0.1:10531/v1`
- Model đã xác nhận (2026-10-03): `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-image-2`. Danh sách có thể đổi, chạy lại lệnh start để xem.
- Đã test thành công: `/v1/chat/completions` (gpt-5.5), `/v1/responses` (gpt-5.5), `/v1/images/generations` (gpt-image-2).

## Quy tắc quan trọng

Khi người dùng nhờ tạo ảnh hoặc hỏi GPT: **Claude tự thực hiện toàn bộ** (kiểm tra server, khởi động server nếu chưa chạy, gọi API, lưu ảnh, xem lại ảnh). Không đưa lệnh cho người dùng tự chạy. Chỉ hỏi người dùng khi cần họ đăng nhập ChatGPT/Codex hoặc thiếu thông tin về nội dung ảnh.

## Bước 1: bảo đảm server đang chạy

Kiểm tra: `curl http://127.0.0.1:10531/v1/models` (hoặc `Invoke-RestMethod` trên PowerShell). Nếu lỗi kết nối, tự khởi động:

```
npx -y -p openai-oauth -p zod openai-oauth --detach
```

(Phải thêm `-p zod`, nếu không `npx openai-oauth` báo thiếu package `zod`.) Đợi vài giây rồi kiểm tra lại.
Dừng: `npx openai-oauth stop`. Log: `npx openai-oauth logs --follow`.
Nếu báo chưa đăng nhập, bảo người dùng tự đăng nhập ChatGPT/Codex; không được tự nhập mật khẩu.

## Bước 2: gọi model

Chat / suy luận (PowerShell):
```powershell
$b=@{model="gpt-5.5";messages=@(@{role="user";content="..."})}|ConvertTo-Json -Depth 4
(Invoke-RestMethod http://127.0.0.1:10531/v1/chat/completions -Method Post -ContentType "application/json" -Body $b -TimeoutSec 120).choices[0].message.content
```
Dùng `/v1/responses` với `input` nếu cần API Responses. Model suy luận tốn token ẩn (reasoning), nên đừng đặt giới hạn token quá thấp.

Tạo ảnh: dùng script `gen-image.mjs` nằm cùng thư mục với file SKILL.md này (chạy trên Windows/macOS/Linux, cần Node 18+; máy đã có Node vì dùng npx). Thư mục skill thường là `~/.claude/skills/gpt/` (Windows: `%USERPROFILE%\.claude\skills\gpt\`). Nếu không thấy, tìm đường dẫn thật của SKILL.md này; không dùng đường dẫn của máy khác.
```
node "<thư-mục-skill>/gen-image.mjs" --prompt "..." --out "<đường-dẫn>/anh.png" [--size 1024x1024]
```
`gen-image.ps1` là bản PowerShell cho Windows (tham số `-Prompt -Out -Size`), ưu tiên dùng `.mjs`. Người dùng không nói lưu ở đâu thì lưu vào thư mục làm việc hiện tại. Sau đó dùng Read để xem ảnh và kiểm tra kết quả.

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
