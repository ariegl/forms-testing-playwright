CREATE DATABASE IF NOT EXISTS simple_crud;
USE simple_crud;

-- Table: roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Table: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(50) NOT NULL,
  password VARCHAR(128) DEFAULT NULL,
  registered_date DATETIME DEFAULT NULL,
  role_id INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  profile_image_path VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Table: posts
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_date DATETIME DEFAULT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: posts_likes
CREATE TABLE posts_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_post_like (user_id, post_id),
  CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: posts_comments
CREATE TABLE posts_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  comment VARCHAR(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: friendships
CREATE TABLE friendships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  addressee_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY unique_friendship (requester_id, addressee_id),
  CONSTRAINT fk_friend_requester FOREIGN KEY (requester_id) REFERENCES users(id),
  CONSTRAINT fk_friend_addressee FOREIGN KEY (addressee_id) REFERENCES users(id)
);

-- Trigger: prevent_opposite_friendship
DELIMITER //
CREATE TRIGGER prevent_opposite_friendship 
BEFORE INSERT ON friendships 
FOR EACH ROW 
BEGIN 
    IF (SELECT COUNT(*) FROM friendships WHERE requester_id = NEW.addressee_id AND addressee_id = NEW.requester_id AND deleted_at IS NULL) > 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Friendship record already exists in the opposite direction'; 
    END IF; 
END //
DELIMITER ;

-- Table: private_messages
CREATE TABLE private_messages (
  id CHAR(36) PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  read_at DATETIME DEFAULT NULL,
  deleted_by_sender DATETIME DEFAULT NULL,
  deleted_by_receiver DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
);
