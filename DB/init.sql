CREATE DATABASE IF NOT EXISTS `carddb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `carddb`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');

ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;

-- create database carddb;
-- CREATE TABLE IF NOT EXISTS `carddb`.`Card` (
--   `card_id` INT NOT NULL,
--   `hp_pull` INT NOT NULL,
--   `mana_pull` INT NOT NULL,
--   `damage` INT NOT NULL,
--   `card_name` VARCHAR(45) NOT NULL,
--   `drop_rate` INT NOT NULL,
--   `card_type` VARCHAR(45) NOT NULL,
--   `mana_use` INT NOT NULL,
--   PRIMARY KEY (`card_id`))
-- ENGINE = InnoDB;


-- -- -----------------------------------------------------
-- -- Table `mydb`.`pack`
-- -- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `carddb`.`pack` (
--   `pack_id` INT NOT NULL,
--   `card_on_colod` INT(32) NOT NULL,
--   `name_pack` VARCHAR(45) NOT NULL,
--   `Card_card_id` INT NOT NULL,
--   PRIMARY KEY (`pack_id`),
--   INDEX `fk_pack_Card1_idx` (`Card_card_id` ASC),
--   CONSTRAINT `fk_pack_Card1`
--     FOREIGN KEY (`Card_card_id`)
--     REFERENCES `carddb`.`Card` (`card_id`)
--     ON DELETE NO ACTION
--     ON UPDATE NO ACTION)
-- ENGINE = InnoDB;


-- -- -----------------------------------------------------
-- -- Table `mydb`.`User`
-- -- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `carddb`.`User` (
--   `user_id` INT NOT NULL AUTO_INCREMENT,
--   `login` VARCHAR(45) NOT NULL,
--   `password` VARCHAR(45) NOT NULL,
--   `nickname` VARCHAR(45) NOT NULL,
--   `email` VARCHAR(45) NOT NULL,
--   `gold` INT NOT NULL,
--   `matches` INT NULL,
--   `matches_win` INT NULL,
--   `pack_pack_id` INT NOT NULL,
--   PRIMARY KEY (`user_id`),
--   INDEX `fk_User_pack_idx` (`pack_pack_id` ASC),
--   CONSTRAINT `fk_User_pack`
--     FOREIGN KEY (`pack_pack_id`)
--     REFERENCES `carddb`.`pack` (`pack_id`)
--     ON DELETE NO ACTION
--     ON UPDATE NO ACTION)
-- ENGINE = InnoDB;

-- insert into Card(card_id,hp_pull,mana_pull,damage,card_name,drop_rate,card_type,mana_use) 
-- values(1,10,20,5,"test_card",10,"magic_defence",3);
-- insert into pack(pack_id,card_on_colod,name_pack,Card_card_id) values(1,10,"test",1);
