import CryptoJS from 'crypto-js';

const SECRET_KEY = 'alx-chat-app';

/**
 * Hàm mã hóa message trước khi gửi
 * @param {*} message 
 * @returns 
 */
export const encryptMessage = (message) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(message),
    CryptoJS.enc.Utf8.parse(SECRET_KEY),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  
  return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
};

/**
 * Hàm giải mã message khi nhận
 * @param {*} ciphertext 
 * @returns 
 */
export const decryptMessage = (ciphertext) => {
  const encryptedData = CryptoJS.enc.Base64.parse(ciphertext);
  const iv = encryptedData.clone().words.slice(0, 4);
  const actualCiphertext = encryptedData.clone().words.slice(4);
  
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.lib.WordArray.create(actualCiphertext) },
    CryptoJS.enc.Utf8.parse(SECRET_KEY),
    {
      iv: CryptoJS.lib.WordArray.create(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};