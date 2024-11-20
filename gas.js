// BCCメールアドレス
const BBC_EMAIL = "atsushi_sunahara+bcc@token.co.jp";

// 送信元メールアドレス
const FROM_EMAIL = "test@token.co.jp";

// ファイル関連の定数
const FILE_CONFIG = {
    URL: 'https://sunajpdev.github.io/応募フォーム.pdf',
    NAME: '営業部紹介資料.pdf',
    MIME_TYPE: 'application/pdf'
};

// メールテンプレートの定義
const EMAIL_TITLE = "応募を受け付けました";
const EMAIL_TEMPLATE = (name) => `
${name} 様

東建コーポレーションの採用面接にご応募いただき、ありがとうございました。
選考日程の詳細について、弊社担当者より後日ご連絡させていただきます。
営業部の紹介資料を添付いたします。ご一読いただけると幸いです。
よろしくお願いいたします。
`;

// フォーム送信時の処理
function onFormSubmit(e) {

    Logger.log('Received data: ' + JSON.stringify(e.namedValues));
    const response = e.namedValues;
    
    // 日本語から英語へのマッピング
    const fieldMapping = {
        'お名前': 'name',
        'ご年齢': 'age',
        '性別': 'gender',
        'メールアドレス': 'email',
        '電話番号': 'phone',
        '希望勤務地': 'location',
        '3.その他、留意事項等あれば教えてください。': 'notes',
        '4.入社希望者本人の承諾を得ていますか？': 'consent',
        '紹介者氏名': 'employee_name',
        '紹介者所属': 'employee_branch'
    };

        // PDFを取得
        const responsePdf = UrlFetchApp.fetch(FILE_CONFIG.URL);
        const pdfBlob = responsePdf.getBlob();
        pdfBlob.setContentType(FILE_CONFIG.MIME_TYPE);
    
    try {
        // 変換したデータを新しいオブジェクトに格納
        const formData = {};
        for (let [jpKey, value] of Object.entries(response)) {
            const engKey = fieldMapping[jpKey];
            if (engKey) {
                formData[engKey] = value[0];
            }
        }
        
        Logger.log('Converted data: ' + JSON.stringify(formData));
                
        // メール本文の作成
        const body = EMAIL_TEMPLATE(formData.name);

        Logger.log('Email body: ' + body);
        
        // メール送信
        MailApp.sendEmail({
            to: formData.email,
            bcc: BBC_EMAIL,
            from: FROM_EMAIL,
            subject: EMAIL_TITLE,
            body: body,
            attachments: [{
                fileName: FILE_CONFIG.NAME,
                content: pdfBlob.getBytes(),
                mimeType: FILE_CONFIG.MIME_TYPE
            }]
        });
        
    } catch (error) {
        Logger.log('Error details: ' + error);
        Logger.log('Available fields: ' + Object.keys(response));
    }
}