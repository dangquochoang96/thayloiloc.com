# Quick Start - Hệ Thống Q&A

## Bước 1: Update Firebase Rules (BẮT BUỘC)

1. Mở Firebase Console: https://console.firebase.google.com/
2. Chọn project: `thayloiloc-1621d`
3. Vào **Realtime Database** → **Rules**
4. Copy nội dung file `firebase-rules.json` và paste vào
5. Click **Publish**

## Bước 2: Test Hệ Thống

### Test Chưa Đăng Nhập

1. Mở website (chưa đăng nhập)
2. Click menu "Hỏi Đáp"
3. **Kết quả mong đợi**:
   - ❌ Không thấy nút "Tạo câu hỏi"
   - ✅ Thấy "Vui lòng đăng nhập để tạo câu hỏi"

### Test Đã Đăng Nhập

1. Đăng nhập vào website
2. Click menu "Hỏi Đáp"
3. **Kết quả mong đợi**:
   - ✅ Thấy nút "Tạo câu hỏi"
   - ✅ Click được nút

### Test Tạo Bài Đăng

1. Click "Tạo câu hỏi"
2. Điền:
   - Tiêu đề: "Test câu hỏi"
   - Nội dung: "Đây là test"
   - Upload 1-2 hình ảnh (tùy chọn)
3. Click "Đăng bài"
4. **Kết quả mong đợi**:
   - ✅ Hiện toast "Đăng bài thành công!"
   - ✅ Bài đăng xuất hiện trong danh sách
   - ✅ Hình ảnh hiển thị đúng

### Test Comment

1. Click vào bài đăng vừa tạo
2. Nhập comment: "Test comment"
3. Click "Gửi bình luận"
4. **Kết quả mong đợi**:
   - ✅ Comment xuất hiện ngay lập tức
   - ✅ Số lượng comment tăng lên

### Test Xóa

1. Trong chi tiết bài đăng
2. Click nút "Xóa bài" (chỉ thấy nếu là chủ bài)
3. Confirm
4. **Kết quả mong đợi**:
   - ✅ Bài đăng bị xóa
   - ✅ Redirect về danh sách

## Bước 3: Kiểm Tra Firebase

1. Vào Firebase Console → Realtime Database
2. Xem data trong:
   - `qna_posts` - Có bài đăng vừa tạo
   - `qna_comments` - Có comment vừa tạo
3. Kiểm tra:
   - ✅ Hình ảnh được lưu dưới dạng Base64
   - ✅ userId, userName có đúng
   - ✅ Timestamps có đúng

## Bước 4: Monitor Usage

1. Vào Firebase Console → Realtime Database → Usage
2. Theo dõi:
   - Storage used (max 1GB free)
   - Bandwidth (max 10GB/month free)
   - Connections (max 100 free)

## Troubleshooting

### Lỗi: "Permission denied"

**Nguyên nhân**: Chưa update Firebase Rules

**Giải pháp**:
1. Check Firebase Console → Realtime Database → Rules
2. Đảm bảo có:
   ```json
   "qna_posts": {
     ".read": true,
     ".write": true
   }
   ```
3. Click Publish

### Lỗi: "Bạn cần đăng nhập"

**Nguyên nhân**: Chưa đăng nhập hoặc session hết hạn

**Giải pháp**:
1. Đăng nhập lại
2. Check localStorage có `user_info` không:
   ```javascript
   localStorage.getItem('user_info')
   ```

### Hình ảnh không hiển thị

**Nguyên nhân**: Hình quá lớn hoặc format không đúng

**Giải pháp**:
1. Chọn hình < 2MB
2. Format: JPG, PNG, GIF
3. Hệ thống sẽ tự động compress

### Không thấy nút "Tạo câu hỏi"

**Nguyên nhân**: Chưa đăng nhập

**Giải pháp**:
1. Đăng nhập vào website
2. Refresh trang Q&A

## Tính Năng Đã Có

✅ Tạo bài đăng với tiêu đề, nội dung, hình ảnh
✅ Upload nhiều hình (max 5)
✅ Tự động compress hình xuống < 500KB
✅ Danh sách bài đăng theo thời gian
✅ Phân trang (load more)
✅ Chi tiết bài đăng
✅ Gallery hình ảnh (click phóng to)
✅ Comment realtime
✅ Xóa bài đăng (chỉ chủ bài)
✅ Xóa comment (chỉ chủ comment)
✅ Toast notifications
✅ Responsive design
✅ Authentication checks

## Giới Hạn FREE

- **Storage**: 1GB (~2000-5000 bài đăng)
- **Bandwidth**: 10GB/month (~10k-50k views)
- **Reads/Writes**: Unlimited
- **Connections**: 100 đồng thời

## Files Quan Trọng

- `firebase-rules.json` - Rules cần paste vào Firebase
- `AUTHENTICATION_FLOW.md` - Giải thích authentication
- `FIREBASE_FREE_SETUP.md` - Hướng dẫn chi tiết
- `src/services/qna.service.js` - Logic chính
- `src/pages/QnAPage.js` - Trang danh sách
- `src/pages/QnADetailPage.js` - Trang chi tiết

## Support

Nếu gặp vấn đề:
1. Check browser console (F12) cho errors
2. Check Firebase Console → Realtime Database → Data
3. Check Firebase Console → Realtime Database → Rules
4. Review `AUTHENTICATION_FLOW.md`

---

**Chúc bạn thành công! 🎉**
