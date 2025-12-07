
import type { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'S01',
    title: 'Đăng ảnh "dìm hàng" bạn bè',
    description: 'Bạn chụp được một bức ảnh không đẹp của bạn thân và nghĩ rằng sẽ rất vui nếu đăng nó lên nhóm lớp để trêu chọc.',
    icon: 'CameraIcon',
    options: [
      { id: 0, text: 'Đăng ngay cho vui, bạn bè thân thiết không ngại đâu.' },
      { id: 1, text: 'Hỏi ý kiến bạn trước khi đăng.' },
      { id: 2, text: 'Không đăng và xóa ảnh đi.' },
    ],
    feedback_per_option: {
      0: {
        ethical: "Hành động này thiếu tôn trọng quyền riêng tư và hình ảnh cá nhân của bạn, có thể khiến bạn bị tổn thương hoặc xấu hổ.",
        legal: "Việc đăng ảnh người khác mà không có sự cho phép có thể vi phạm quyền cá nhân được pháp luật bảo vệ. Mặc dù ở mức độ bạn bè có thể không bị kiện cáo, nhưng đây là hành vi không được khuyến khích.",
        recommended_action: "Nên gỡ bài đăng ngay lập tức, xin lỗi bạn và giải thích rằng đó chỉ là một trò đùa thiếu suy nghĩ. Lần sau, hãy luôn hỏi ý kiến trước khi đăng bất cứ thứ gì liên quan đến người khác.",
        law_refs: ["Bộ luật Dân sự 2015 về Quyền của cá nhân đối với hình ảnh"],
        positive_alternative: "Bạn có thể gửi riêng bức ảnh cho người bạn đó xem. Nếu bạn ấy thấy vui và đồng ý, lúc đó hãy chia sẻ.",
        severity_score: 5
      },
      1: {
        ethical: "Đây là hành động đúng đắn và thể hiện sự tôn trọng tuyệt đối với bạn bè. Bạn đã cân nhắc đến cảm xúc của họ.",
        legal: "Hành động này hoàn toàn tuân thủ pháp luật vì đã có sự đồng ý của người trong ảnh.",
        recommended_action: "Hãy tiếp tục phát huy thói quen tốt này. Việc hỏi ý kiến trước khi hành động sẽ giúp duy trì các mối quan hệ bền vững và tích cực.",
        law_refs: [],
        positive_alternative: "Tiếp tục duy trì thói quen tôn trọng ý kiến người khác.",
        severity_score: 1
      },
      2: {
        ethical: "Đây là một lựa chọn an toàn và tử tế. Bạn đã đặt tình bạn và cảm xúc của người khác lên trên một trò đùa nhất thời.",
        legal: "Không có vấn đề pháp lý nào phát sinh từ hành động này.",
        recommended_action: "Bạn đã hành động đúng. Luôn cân nhắc tác động của hành động của mình lên người khác là một kỹ năng sống quan trọng.",
        law_refs: [],
        positive_alternative: "Bạn có thể tìm những khoảnh khắc đẹp hơn của bạn bè để lưu giữ và chia sẻ.",
        severity_score: 1
      }
    }
  },
  {
    id: 'S02',
    title: 'Lan truyền tin đồn',
    description: 'Bạn nghe được một tin đồn chưa kiểm chứng về một bạn khác trong trường và cảm thấy rất muốn kể cho nhóm bạn thân của mình.',
    icon: 'Share2Icon',
    options: [
      { id: 0, text: 'Chia sẻ ngay trong nhóm chat, vì chỉ là bạn thân thôi.' },
      { id: 1, text: 'Không chia sẻ và khuyên người kể cho bạn cũng nên dừng lại.' },
      { id: 2, text: 'Đi hỏi thẳng bạn kia xem có đúng không.' },
    ],
     feedback_per_option: {
      0: {
        ethical: "Việc lan truyền tin đồn, dù trong nhóm nhỏ, cũng góp phần làm tổn thương người khác và tạo ra một môi trường học đường tiêu cực.",
        legal: "Nếu tin đồn đó sai sự thật và gây ảnh hưởng đến danh dự, nhân phẩm của người khác, người phát tán có thể bị xử lý hành chính. Mức độ xử lý tùy thuộc vào hậu quả gây ra.",
        recommended_action: "Dừng việc chia sẻ thông tin. Nếu đã lỡ chia sẻ, hãy đính chính trong nhóm rằng đó là thông tin chưa được kiểm chứng và không nên lan truyền thêm.",
        law_refs: ["Nghị định 15/2020/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực bưu chính, viễn thông"],
        positive_alternative: "Hãy kiểm chứng thông tin từ nguồn chính thống hoặc người có thẩm quyền trước khi tin vào nó.",
        severity_score: 6
      },
      1: {
        ethical: "Đây là hành động rất có trách nhiệm. Bạn đã phá vỡ chuỗi lan truyền thông tin tiêu cực và bảo vệ người khác.",
        legal: "Hành động này giúp bạn tránh mọi rủi ro pháp lý liên quan đến việc phát tán thông tin sai sự thật.",
        recommended_action: "Hãy tiếp tục là một người bạn đáng tin cậy và là một công dân số có trách nhiệm. Hành động của bạn góp phần xây dựng môi trường mạng an toàn hơn.",
        law_refs: [],
        positive_alternative: "Khuyên bạn bè nên tập trung vào những thông tin tích cực và có ích hơn.",
        severity_score: 1
      },
      2: {
        ethical: "Hỏi thẳng có thể là một cách để tìm sự thật, nhưng cần hết sức khéo léo để không làm tổn thương hay gây khó xử cho bạn kia. Cách tiếp cận có thể bị coi là tọc mạch.",
        legal: "Không có vấn đề pháp lý, nhưng cách thực hiện có thể gây ra các vấn đề về mối quan hệ xã hội.",
        recommended_action: "Nếu thực sự quan tâm, hãy tiếp cận một cách riêng tư và chân thành. Tuy nhiên, lựa chọn tốt nhất thường là không can thiệp vào những chuyện chưa được xác thực.",
        law_refs: [],
        positive_alternative: "Tìm hiểu thông tin một cách tế nhị, hoặc chờ đợi thông tin chính thức.",
        severity_score: 3
      }
    }
  }
];