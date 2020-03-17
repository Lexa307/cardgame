CREATE DATABASE IF NOT EXISTS `carddb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `carddb`;
CREATE TABLE IF NOT EXISTS `ranks` (
  `rank_id` INT NOT NULL AUTO_INCREMENT,
  `rank_name` VARCHAR(45) NOT NULL,
  `condition` INT NOT NULL,
  PRIMARY KEY (`rank_id`))
ENGINE = InnoDB CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
   `gold` INT NOT NULL,
   `rank_points` INT NOT NULL,
   `rank` INT,
   `matches` INT NOT NULL,
   `matches_win` INT NOT NULL,
    FOREIGN KEY (`rank`)
	REFERENCES `carddb`.`ranks` (`rank_id`) ON DELETE SET NULL,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `packs` (
  `pack_id` INT NOT NULL AUTO_INCREMENT,
  `cost` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `pack_description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`pack_id`))
ENGINE = InnoDB CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `card` (
  `card_id` INT NOT NULL AUTO_INCREMENT,
  `hp_pull` INT NOT NULL,
  `mana_pull` INT NOT NULL,
  `damage` INT NOT NULL,
  `card_name` VARCHAR(45) NOT NULL,
  `card_description` VARCHAR(255) NOT NULL,
  `drop_rate` INT,
  `pack_id` INT, -- из какого набора
  `logic_id` INT, -- механика способности
  `res_path1` VARCHAR(255) NOT NULL, -- текстура в рукаве/колоде
  `res_path2` VARCHAR(255) NOT NULL, -- текстура на поле боя
  `card_type` VARCHAR(45) NOT NULL,
     FOREIGN KEY (`pack_id`)
 REFERENCES `carddb`.`packs` (`pack_id`) ON DELETE SET NULL,
  PRIMARY KEY (`card_id`))
ENGINE = InnoDB CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `deck` (
`user_id` INT ,
`card_id` INT ,
`pos` INT,
  FOREIGN KEY (`user_id`)
 REFERENCES `carddb`.`accounts` (`id`) ON DELETE SET NULL,
   FOREIGN KEY (`card_id`)
 REFERENCES `carddb`.`card` (`card_id`) ON DELETE SET NULL

)ENGINE = InnoDB CHARSET=utf8;
CREATE INDEX users_id ON deck (user_id);




