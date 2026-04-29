// ============================================================
//  QR-Based Digital ID & Entry Logger — Apps Script Backend
//  FIXED: CORS + doPost handling
// ============================================================

const SHEET_USERS = "Users";
const SHEET_LOGS  = "Logs";
const COOLDOWN_MS = 10000;

function doGet(e) {
  if (e && e.parameter && e.parameter.id) {
    const result = processScan(e.parameter.id);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService
    .createHtmlOutputFromFile("generate")
    .setTitle("QR Entry Logger")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    let id;
    if (e.postData && e.postData.contents) {
      const payload = JSON.parse(e.postData.contents);
      id = payload.id;
    } else if (e.parameter && e.parameter.id) {
      id = e.parameter.id;
    }
    if (!id) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "No ID provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const result = processScan(id);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Server error: " + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processScan(scannedId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const ss         = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName(SHEET_USERS);
    const logsSheet  = ss.getSheetByName(SHEET_LOGS);
    if (!usersSheet || !logsSheet) {
      return { status: "error", message: "Sheets not found. Check sheet names." };
    }
    const usersData = usersSheet.getDataRange().getValues();
    let user = null;
    for (let i = 1; i < usersData.length; i++) {
      if (String(usersData[i][0]).trim() === String(scannedId).trim()) {
        user = { id: usersData[i][0], name: usersData[i][1] };
        break;
      }
    }
    if (!user) {
      return { status: "error", message: "Invalid QR Code — User not found." };
    }
    const logsData = logsSheet.getDataRange().getValues();
    let lastStatus    = null;
    let lastTimestamp = null;
    for (let i = logsData.length - 1; i >= 1; i--) {
      if (String(logsData[i][0]).trim() === String(scannedId).trim()) {
        lastStatus    = logsData[i][3];
        lastTimestamp = new Date(logsData[i][2]);
        break;
      }
    }
    if (lastTimestamp) {
      const elapsed = new Date() - lastTimestamp;
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return { status: "cooldown", message: "Please wait " + remaining + "s before scanning again." };
      }
    }
    const newStatus = lastStatus === "IN" ? "OUT" : "IN";
    logsSheet.appendRow([user.id, user.name, new Date(), newStatus]);
    return { status: "success", name: user.name, entry: newStatus, message: user.name + " marked " + newStatus };
  } finally {
    lock.releaseLock();
  }
}

function generateQRCodesForAllUsers() {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEET_USERS);
  const data       = usersSheet.getDataRange().getValues();
  let folder;
  const folders = DriveApp.getFoldersByName("QR_Codes");
  folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("QR_Codes");
  for (let i = 1; i < data.length; i++) {
    const id   = String(data[i][0]).trim();
    const name = String(data[i][1]).trim();
    if (!id) continue;
    const qrUrl   = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(id);
    const response = UrlFetchApp.fetch(qrUrl);
    const blob     = response.getBlob().setName("QR_" + id + "_" + name + ".png");
    const existing = folder.getFilesByName("QR_" + id + "_" + name + ".png");
    while (existing.hasNext()) existing.next().setTrashed(true);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    usersSheet.getRange(i + 1, 3).setValue(file.getUrl());
    Utilities.sleep(300);
  }
  SpreadsheetApp.getUi().alert("QR codes generated!");
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let u = ss.getSheetByName(SHEET_USERS);
  if (!u) u = ss.insertSheet(SHEET_USERS);
  if (u.getLastRow() === 0) {
    u.appendRow(["ID", "Name", "QR Drive Link"]);
    u.getRange("A1:C1").setFontWeight("bold").setBackground("#4285F4").setFontColor("#FFFFFF");
  }
  let l = ss.getSheetByName(SHEET_LOGS);
  if (!l) l = ss.insertSheet(SHEET_LOGS);
  if (l.getLastRow() === 0) {
    l.appendRow(["ID", "Name", "Timestamp", "Status"]);
    l.getRange("A1:D1").setFontWeight("bold").setBackground("#34A853").setFontColor("#FFFFFF");
  }
  SpreadsheetApp.getUi().alert("Sheets are ready!");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎫 QR System")
    .addItem("1. Setup Sheets",          "setupSheets")
    .addItem("2. Generate All QR Codes", "generateQRCodesForAllUsers")
    .addToUi();
}
