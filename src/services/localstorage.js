/**
 * Class LocalStorageService để lưu trữ và truy cập dữ liệu trong localStorage.
 * 
 * Cung cấp các phương thức để đọc, ghi và xóa dữ liệu trong localStorage.
 */
class LocalStorageService {
    static getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error(`Lỗi đọc từ localStorage [${key}]:`, error);
        return null;
      }
    }
  
    static setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Lỗi ghi vào localStorage [${key}]:`, error);
      }
    }
  
    static removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Lỗi xóa khỏi localStorage [${key}]:`, error);
      }
    }
  
    static getRoomData() {
        try {
          const roomData = this.getItem('room');
          return roomData ? JSON.parse(roomData) : null;
        } catch (error) {
          console.error('Lỗi đọc room data:', error);
          this.removeItem('room');
          return null;
        }
      }
    
      static setRoomData({ roomName, displayName, password }) {
        try {
          const roomData = JSON.stringify({ roomName, displayName, password });
          this.setItem('room', roomData);
        } catch (error) {
          console.error('Lỗi lưu room data:', error);
        }
      }
    
      static clearRoomData() {
        this.removeItem('room');
      }
  }
  
  export default LocalStorageService;
  