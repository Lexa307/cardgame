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

CREATE TABLE IF NOT EXISTS `logic` (
`logic_id` INT NOT NULL AUTO_INCREMENT,
`name` VARCHAR(45) ,
`description` VARCHAR(255),
 PRIMARY KEY (`logic_id`)
)ENGINE = InnoDB CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `card` (
  `card_id` INT NOT NULL AUTO_INCREMENT,
  `hp_pull` INT NOT NULL,
  `mana_pull` INT NOT NULL,
  `damage` INT NOT NULL,
  `coast` INT NOT NULL,
  `card_name` VARCHAR(45) NOT NULL,
  `card_description` VARCHAR(255) NOT NULL,
  `drop_rate` INT,
  `pack_id` INT, -- из какого набора
  `logic_id` INT, -- механика способности
  `res_path` VARCHAR(255) NOT NULL, -- текстура в рукаве/колоде
  `card_type` VARCHAR(45) NOT NULL,
  CONSTRAINT pack_id_fk 
     FOREIGN KEY (`pack_id`)
 REFERENCES `carddb`.`packs` (`pack_id`) ON DELETE SET NULL,
  FOREIGN KEY (`logic_id`)
 REFERENCES `carddb`.`logic` (`logic_id`) ON DELETE SET NULL,
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
CREATE INDEX fk_users_id ON deck (user_id);



insert into ranks (`rank_name`,`condition`)values('bronze',50);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ('test1', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test1@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test2', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test2@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test3', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test3@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ('test4', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test4@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test5', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test5@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test6', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test6@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test7', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test7@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test8', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test8@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test9', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test9@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`accounts` ( `username`, `password`, `email`, `gold`, `rank_points`, `rank`, `matches`, `matches_win`) VALUES ( 'test10', '$argon2i$v=19$m=4096,t=3,p=1$MMHe80nfoBAetzqBPuzoTg$0BwZjl7onDLFwBzTWcqXBUTG5szpldvQUkb8hwLnLxI', 'test10@test.ru', 5000, 0, 1, 0, 0);
INSERT INTO `carddb`.`packs` (`pack_id`, `cost`, `name`, `pack_description`) VALUES (1, 0, 'StarterPuck', 'based pack for new players');
INSERT INTO `carddb`.`logic` (`name`, `description`) VALUES ('test', 'for developer');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (0, 0, 0,65, 'Норна', 'богиня судьбы, показывает какие карты подготовил  для вас противник.', 100, 1, 1, 'textures/card1', 'skill');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (5, 0, 7,20, 'Эйнхерии', 'Один из сильнейших павших воинов. ', 100, 1, 1, 'textures/card2', 'default');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (10, 0, 13,9, 'Валькирия ', 'Дочь славного война. ', 100, 1, 1, 'textures/card3', 'default');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (0, 0, 0,7, 'Хель', 'Богиня смерти, убивает выбранного всех противников, чье здоровье меньше или равно 2м.', 100, 1, 1, 'textures/card4', 'skill');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (0, 0, 0,1, 'Эйр ', 'Богиня Медицины, Поднимает здоровье всех союзных существ 2 единицы.', 100, 1,1, 'textures/card5', 'skill');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (0, 0, 0,3, 'Видар', 'бог мести. Заклинает союзное существо, при  его гибели, погибает  и сам палач. ', 100, 1, 1, 'textures/card6', 'skill');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (0, 0, 0,3, 'Огненный великан', 'Способен манипулировать огнём, опасный страж, через которого никто не пройдет ', 100, 1, 1, 'textures/card7', 'provoke');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (3, 10, 4,2, 'Локи', 'Бог обмана .При достаточном  накоплении магического запаса способен создать своего клона. ', 100,1, 1, 'textures/card8', 'default');
INSERT INTO `carddb`.`card` (`hp_pull`, `mana_pull`, `damage`,`coast`, `card_name`, `card_description`, `drop_rate`, `pack_id`, `logic_id`, `res_path`, `card_type`) VALUES (4, 0, 5,5, 'Стрелок Адрик', 'Стрелок Адрик', 100, 1, 1, 'textures/card9', 'default');
-- insert into carddb.deck(user_id,card_id,pos) values (1,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (1,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (1,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (1,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (1,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (1,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (1,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (1,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (1,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (2,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (2,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (2,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (2,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (2,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (2,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (2,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (2,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (2,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (3,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (3,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (3,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (3,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (3,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (3,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (3,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (3,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (3,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (4,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (4,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (4,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (4,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (4,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (4,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (4,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (4,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (4,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (5,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (5,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (5,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (5,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (5,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (5,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (5,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (5,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (5,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (6,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (6,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (6,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (6,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (6,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (6,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (6,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (6,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (6,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (7,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (7,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (7,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (7,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (7,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (7,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (7,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (7,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (7,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (8,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (8,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (8,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (8,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (8,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (8,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (8,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (8,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (8,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (9,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (9,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (9,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (9,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (9,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (9,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (9,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (9,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (9,1,1);
-- insert into carddb.deck(user_id,card_id,pos) values (10,9,9);
-- insert into carddb.deck(user_id,card_id,pos) values (10,8,8);
-- insert into carddb.deck(user_id,card_id,pos) values (10,7,7);
-- insert into carddb.deck(user_id,card_id,pos) values (10,6,6);
-- insert into carddb.deck(user_id,card_id,pos) values (10,5,5);
-- insert into carddb.deck(user_id,card_id,pos) values (10,4,4);
-- insert into carddb.deck(user_id,card_id,pos) values (10,3,3);
-- insert into carddb.deck(user_id,card_id,pos) values (10,2,2);
-- insert into carddb.deck(user_id,card_id,pos) values (10,1,1);
-- 

