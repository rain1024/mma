# Product Specification

# General Requirements

- Beautiful and modern UI/UX design

# Features

## Feature Athletes Page

Yêu cầu:

- Có tính năng search
- Có tính năng filter by gender
- Khi click vào 1 athlete sẽ chuyển đến trang chi tiết athlete đó

Ghi chú:
- Cảm hứng từ trang athletes của UFC https://www.ufc.com/athletes (chỉ mang tính chất tham khảo)

## Feature Athlete Detail Page

- Hiển thị chi tiết thông tin của một athlete cụ thể
- URL của trang athlete detail sẽ là /athletes/{athleteId} (ví dụ: /athletes/john-doe)
- Hiển thị thông tin cơ bản: tên, quốc gia, cân nặng, hạng cân, thành tích thắng thua, ảnh đại diện
- Hiển thị danh sách các trận đấu và giải đấu đã tham gia với kết quả thắng thua.
  + Với mỗi trận đấu, hiển thị tên và logo của giải đấu
  + Nếu có video thì có nút "Watch Video". 
  + Khi click vào thông tin giải đấu sẽ chuyển đến trang chi tiết giải đấu tương ứng.
- Hiển thị link đến các url của athlete (nếu có)

## Feature Rankings Page

- Hiển thị bảng xếp hạng Pound-for-Pound (P4P)
- Hiển thị bảng xếp hạng các athletes theo hạng cân
- URL của trang rankings sẽ là /rankings

## Feature Navigation

- Mỗi lần click vào 1 item trên navigation bar thì sẽ chuyển trang tương ứng, url sẽ thay đổi theo trang được chuyển đến (ví dụ như trang athletes thì url sẽ là /athletes, trang home thì url sẽ là /, trang Rankings thì url sẽ là /rankings, trang Events thì url sẽ là /events)

## Feature Events Page

- Hiển thị danh sách các events của giải đấu tương ứng
- Hiển thị thông tin cơ bản của event mới nhất
- URL của trang events sẽ là /events

## Feature Event Detail Page

- Hiển thị chi tiết thông tin của một event cụ thể
- Hiển thị danh sách các trận đấu trong event đó
- URL của trang event detail sẽ là /events/{eventId} (ví dụ: /events/lc27)
- Mỗi trận đấu hiển thị kết quả trận đấu, kỹ thuật dùng để thắng, thời gian kết thúc trận đấu
- Nếu trong 1 trận có video, hiển thị nút "Watch Video" để xem video trận đấu
- Khi click vào Althete trong trận đấu sẽ chuyển đến trang chi tiết athlete đó

## Feature Video Player

Nếu có video, khi click vào nút "Watch Video" sẽ mở video player để xem video.

- Nếu video là từ Youtube, sử dụng Youtube embed player để xem video. Chuyển qua trang /matches/{id}?type=youtube&url={youtube_embed_url}
- Nếu video là từ các trang khác, tạo một đường dẫn mới để mở trang xem video.

## Feature Match Detail Page

- Hiển thị video trận đấu
- Hiển thị kết quả trận đấu, kỹ thuật dùng để thắng, thời gian kết thúc trận đấu
- Hiển thị chi tiết thông tin trận đấu (đấu thủ, kết quả)
- Thêm tính năng gãn nhãn thời gian (timestamp) với label cho video để người dùng có thể dễ dàng chuyển đến các phần quan trọng trong trận đấu.
- Cho phép người dùng copy thông tin đã được gắn timestamp dưới dạng json để chia sẻ.
- Design chi tiết
  + Phần video player chiếm 1/2
  + Phần thông tin và timestamp chiếm 1/2 (mỗi phần là 1 tab)