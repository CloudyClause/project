/**
 * 모바일 청첩장 Guestbook - Google Apps Script
 *
 * 사용 방법:
 * 1. Google Sheets에서 시트 이름을 Guestbook 으로 설정
 * 2. 1행에 작성시간 / 이름 / 메시지 입력
 * 3. 이 코드를 Apps Script Code.gs에 그대로 붙여넣기
 * 4. 웹 앱으로 배포
 * 5. 배포된 /exec URL을 웹 프로젝트 script.js에 입력
 */

const SHEET_NAME = "Guestbook";

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeText(value) {
  if (!value) return "";

  return String(value)
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * 방명록 목록 조회
 */
function doGet(e) {
  try {
    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createResponse({
        success: false,
        message: "Guestbook 시트를 찾을 수 없습니다.",
        data: []
      });
    }

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createResponse({
        success: true,
        data: []
      });
    }

    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          3
        )
        .getValues();

    const data =
      values.map((row) => {
        return {
          date: row[0],
          name: row[1],
          message: row[2]
        };
      });

    return createResponse({
      success: true,
      data: data
    });

  } catch (error) {
    return createResponse({
      success: false,
      message: error.message,
      data: []
    });
  }
}

/**
 * 방명록 저장
 */
function doPost(e) {
  const lock =
    LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(
        "Guestbook 시트를 찾을 수 없습니다."
      );
    }

    const name =
      sanitizeText(
        e.parameter.name
      );

    const message =
      sanitizeText(
        e.parameter.message
      );

    if (!name) {
      throw new Error(
        "이름을 입력해주세요."
      );
    }

    if (!message) {
      throw new Error(
        "메시지를 입력해주세요."
      );
    }

    if (name.length > 20) {
      throw new Error(
        "이름은 20자 이하로 입력해주세요."
      );
    }

    if (message.length > 200) {
      throw new Error(
        "메시지는 200자 이하로 입력해주세요."
      );
    }

    sheet.appendRow([
      new Date(),
      name,
      message
    ]);

    return createResponse({
      success: true,
      message: "메시지가 등록되었습니다."
    });

  } catch (error) {
    return createResponse({
      success: false,
      message: error.message
    });

  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // lock을 획득하지 못한 경우 release 예외 무시
    }
  }
}
