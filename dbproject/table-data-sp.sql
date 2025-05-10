create database Project
use Project

CREATE TABLE [User](
    User_ID INT  IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    wallet INT DEFAULT 0,
    account_level int DEFAULT 0,
    user_profile_image VARCHAR(255)
);

CREATE TABLE Game_Catalogue (
    Game_ID INT IDENTITY(1,1) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description VARCHAR(500),
    Game_poster VARCHAR(255),
    rating INT CHECK (rating BETWEEN 0 AND 10),
    publisher_id INT,
    Price DECIMAL(10,2) NOT NULL,
    release_date DATE NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (publisher_id) REFERENCES [User](User_ID)
);

CREATE TABLE Reviews (
    Review_ID INT IDENTITY(1,1) PRIMARY KEY,
    user_ID INT,
    game_ID INT,
    Comment VARCHAR(500),
    Comment_date DATE NOT NULL,
    likes INT DEFAULT 0,
    FOREIGN KEY (user_ID) REFERENCES [User](User_ID),
    FOREIGN KEY (game_ID) REFERENCES Game_Catalogue(Game_ID)
);

CREATE TABLE Cart (
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    PRIMARY KEY (UserID, GameID), -- Composite Primary Key
    FOREIGN KEY (UserID) REFERENCES [User](User_ID),
    FOREIGN KEY (GameID) REFERENCES Game_Catalogue(Game_ID)
);
 
CREATE TABLE Library (
    User_ID INT NOT NULL,
    Game_ID INT NOT NULL,
    Purchase_date DATE NOT NULL,
    Last_played DATE NOT NULL,
    Play_time INT NOT NULL,
    PRIMARY KEY (User_ID, Game_ID),
    FOREIGN KEY (User_ID) REFERENCES [User](User_ID),
    FOREIGN KEY (Game_ID) REFERENCES Game_Catalogue(Game_ID)
);

CREATE TABLE System_Requirements (
    Game_ID INT PRIMARY KEY,
    Processor VARCHAR(255) NOT NULL,
    Gpu VARCHAR(255) NOT NULL,
    Ram VARCHAR(50) NOT NULL,
    Storage VARCHAR(50) NOT NULL,
    OS VARCHAR(100) NOT NULL,
    DXD3_version VARCHAR(50),
    FOREIGN KEY (Game_ID) REFERENCES Game_Catalogue(Game_ID)
);

CREATE TABLE ReviewLikes (
    UserID INT NOT NULL,
    ReviewID INT NOT NULL,
    PRIMARY KEY (UserID, ReviewID),
    FOREIGN KEY (UserID) REFERENCES [User](User_ID),
    FOREIGN KEY (ReviewID) REFERENCES Reviews(Review_ID)
);

GO
-- Signup Procedure
CREATE PROCEDURE Signup
    @username VARCHAR(255),
    @password VARCHAR(255),
    @email VARCHAR(255),
    @date_of_birth DATE
AS
BEGIN
    INSERT INTO [User] (username, password, email, date_of_birth)
    VALUES (@username, @password, @email, @date_of_birth);
END;
GO
-- Login Procedure
CREATE PROCEDURE Login
    @username VARCHAR(255),
    @password VARCHAR(255)
AS
BEGIN
    SELECT User_ID 
    FROM [User]
    WHERE username = @username COLLATE Latin1_General_BIN2
      AND password = @password COLLATE Latin1_General_BIN2;
END;
GO
-- User Library View
CREATE PROCEDURE Library_view
@userID INT
AS
begin
SELECT L.User_ID, G.Game_ID, G.Title, G.[Description], G.rating, G.Game_poster
FROM Library L
JOIN Game_Catalogue G ON L.game_ID = G.Game_ID 
where L.User_ID = @userID;
end

CREATE PROCEDURE Search_Game
    @title VARCHAR(255) = NULL,
    @min_rating INT = NULL,
    @max_rating INT = NULL,
    @publisher_name VARCHAR(255) = NULL,
    @min_release_year INT = NULL,
    @max_release_year INT = NULL,
    @min_price DECIMAL(10,2) = NULL,
    @max_price DECIMAL(10,2) = NULL
AS
BEGIN
    -- Ensure rating constraints
    IF @min_rating < 0 SET @min_rating = 0;
    IF @max_rating > 10 SET @max_rating = 10;

    SELECT gc.*
    FROM Game_Catalogue gc
    JOIN [User] u ON gc.publisher_id = u.User_ID
    WHERE (@title IS NULL OR gc.Title LIKE '%' + @title + '%')
      AND (@min_rating IS NULL OR gc.rating >= @min_rating)
      AND (@max_rating IS NULL OR gc.rating <= @max_rating)
      AND (@publisher_name IS NULL OR u.username LIKE '%' + @publisher_name + '%')
      AND (@min_release_year IS NULL OR YEAR(gc.release_date) >= @min_release_year)
      AND (@max_release_year IS NULL OR YEAR(gc.release_date) <= @max_release_year)
      AND (@min_price IS NULL OR gc.Price >= @min_price)
      AND (@max_price IS NULL OR gc.Price <= @max_price);
END;

GO
-- Purchase Procedure
CREATE PROCEDURE Purchase
    @userID INT,
    @gameID INT,
    @statusMessage NVARCHAR(255) OUTPUT -- Add an output parameter for status
AS
BEGIN
    DECLARE @gamePrice DECIMAL(10,2), @userWallet INT;
    SELECT @gamePrice = Price FROM Game_Catalogue WHERE Game_ID = @gameID;
    SELECT @userWallet = wallet FROM [User] WHERE User_ID = @userID;

    IF @userWallet >= @gamePrice
    BEGIN
        -- Deduct the price from the wallet
        UPDATE [User] SET wallet = wallet - @gamePrice WHERE User_ID = @userID;

        -- Remove the game from the cart if it exists
        EXEC RemoveGameFromCart @User_ID = @userID, @Game_ID = @gameID;

        -- Add the game to the user's library
        INSERT INTO Library (User_ID, game_ID, Purchase_date, Last_played, Play_time)
        VALUES (@userID, @gameID, GETDATE(), GETDATE(), 0);

        -- Set success message
        SET @statusMessage = 'Purchase successful.';
    END
    ELSE
    BEGIN
        -- Set failure message
        SET @statusMessage = 'Insufficient funds in wallet.';
    END
END;
GO
exec Purchase 10,14
GO
-- add to cart
CREATE PROCEDURE AddToCart
    @UserID INT,
    @GameID INT
AS
BEGIN
    -- Check if the game is already in the cart
    IF EXISTS (SELECT 1 FROM Cart WHERE UserID = @UserID AND GameID = @GameID)
    BEGIN
        -- Return an error message
        RAISERROR ('The game is already in the cart.', 16, 1);
        RETURN;
    END
    ELSE
    BEGIN
        -- Insert the game into the cart
        INSERT INTO Cart (UserID, GameID)
        VALUES (@UserID, @GameID);
    END
END;
GO
-- view the details of a game in store
CREATE PROCEDURE ViewGameDetails
    @GameID INT,
    @UserID INT, -- Add UserID as a parameter
    @HasGame BIT OUTPUT -- Add an output parameter for the boolean variable
AS
BEGIN
    -- Check if the user owns the game
    IF EXISTS (SELECT 1 FROM Library WHERE User_ID = @UserID AND Game_ID = @GameID)
    BEGIN
        SET @HasGame = 1; -- User owns the game
    END
    ELSE
    BEGIN
        SET @HasGame = 0; -- User does not own the game
    END

    -- Select game details
    SELECT 
        gc.Game_ID,
        gc.Title,
        gc.Description,
        gc.Game_poster,
        gc.rating,
        gc.Price,
        gc.release_date,
        gc.discount,
        u.username AS Publisher,
        sr.Processor,
        sr.Gpu,
        sr.Ram,
        sr.Storage,
        sr.OS,
        sr.DXD3_version,
        (
            SELECT 
                COUNT(*) 
            FROM 
                Reviews r 
            WHERE 
                r.game_ID = gc.Game_ID
        ) AS Total_Reviews,
        -- Include Last_played and Purchase_date if the user owns the game
        CASE 
            WHEN @HasGame = 1 THEN l.Last_played
            ELSE NULL
        END AS Last_played,
        CASE 
            WHEN @HasGame = 1 THEN l.Purchase_date
            ELSE NULL
        END AS Purchase_date
    FROM 
        Game_Catalogue gc
    LEFT JOIN 
        [User] u ON gc.publisher_id = u.User_ID
    LEFT JOIN 
        System_Requirements sr ON gc.Game_ID = sr.Game_ID
    LEFT JOIN 
        Library l ON l.Game_ID = gc.Game_ID AND l.User_ID = @UserID -- Join with Library to get Last_played and Purchase_date
    WHERE 
        gc.Game_ID = @GameID;
END;
GO
-- for adding review of a ggame 
CREATE PROCEDURE AddReview
    @UserID INT,
    @GameID INT,
    @Comment VARCHAR(500)
AS
BEGIN
    INSERT INTO Reviews (user_ID, game_ID, Comment, Comment_date)
    VALUES (@UserID, @GameID, @Comment, GETDATE());
END;
go

-- procedure to update user profile
CREATE PROCEDURE UpdateUserProfile
    @User_ID INT,
    @NewUsername VARCHAR(255) = NULL,
    @NewEmail VARCHAR(255) = NULL,
    @NewPassword VARCHAR(255) = NULL,
    @NewProfileImage VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Update username if provided
    IF @NewUsername IS NOT NULL
    BEGIN
        UPDATE [User]
        SET username = @NewUsername
        WHERE User_ID = @User_ID;
    END

    -- Update email if provided
    IF @NewEmail IS NOT NULL
    BEGIN
        UPDATE [User]
        SET email = @NewEmail
        WHERE User_ID = @User_ID;
    END

    -- Update password if provided
    IF @NewPassword IS NOT NULL
    BEGIN
        UPDATE [User]
        SET password = @NewPassword
        WHERE User_ID = @User_ID;
    END

    -- Update profile image if provided
    IF @NewProfileImage IS NOT NULL
    BEGIN
        UPDATE [User]
        SET user_profile_image = @NewProfileImage
        WHERE User_ID = @User_ID;
    END
END;

go
--Adding funds to wallet procedure
CREATE PROCEDURE AddFundsToWallet
    @UserID INT,
    @Amount INT
AS
BEGIN
    IF @Amount > 0
    BEGIN
        UPDATE [User]
        SET wallet = wallet + @Amount
        WHERE [User].User_ID = @UserID;
    END
    ELSE
    BEGIN
       PRINT 'Error: Amount to add must be greater than zero.';
    END
END;
drop procedure GetWalletBalance
CREATE PROCEDURE GetWalletBalance
    @UserID INT -- Input parameter for the user ID
AS
BEGIN
    -- Retrieve the wallet balance for the specified user
    SELECT wallet
    FROM [User]
    WHERE User_ID = @UserID;
END;
GO
	
go
exec GetWalletBalance 10
-- procedure to remove game from cart
CREATE PROCEDURE RemoveGameFromCart
    @User_ID INT,
    @Game_ID INT
AS
BEGIN
    
    IF NOT EXISTS (SELECT 1 FROM Cart WHERE UserID = @User_ID AND GameID = @Game_ID)
    BEGIN
        select 'The specified game is not in the cart for the given user.' as message;
        RETURN;
    END

    DELETE FROM Cart
    WHERE UserID = @User_ID AND GameID = @Game_ID;

    select 'Game removed from cart successfully.' as message;
END;
go

-- procedure to view user's purchase history
CREATE PROCEDURE ViewPurchaseHistory
    @User_ID INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Library WHERE User_ID = @User_ID)
    BEGIN
        PRINT 'No purchase history found for the user.';
        RETURN;
    END

    SELECT 
        G.Title AS Game_Title,
        L.Purchase_date AS Purchase_Date,
        G.Price AS Game_Price
    FROM 
        Library L
    JOIN 
        Game_Catalogue G ON L.Game_ID = G.Game_ID
    WHERE 
        L.User_ID = @User_ID
    ORDER BY 
        L.Purchase_date DESC;

   
END;

GO
CREATE PROCEDURE ViewCartContents
    @UserID INT
AS
BEGIN
    -- Check if the user exists
    IF NOT EXISTS (SELECT 1 FROM [User] WHERE User_ID = @UserID)
    BEGIN
        PRINT 'Error: User does not exist.';
        RETURN;
    END

    -- Select the cart contents for the given user
    SELECT 
        c.GameID,
		g.discount AS discount,
        g.Title AS Game_Title,
        g.Price AS Game_Price,
        g.Game_poster AS Game_Poster
    FROM 
        Cart c
    JOIN 
        Game_Catalogue g ON c.GameID = g.Game_ID
    WHERE 
        c.UserID = @UserID;
END;
GO
go
-- procedure to remove a review
CREATE PROCEDURE RemoveReview
    @Review_ID INT
AS
BEGIN
    -- Check if the review exists
    IF NOT EXISTS (SELECT 1 FROM Reviews WHERE Review_ID = @Review_ID)
    BEGIN
        SELECT 'No review found with the specified Review_ID.' AS message;
        RETURN;
    END

    -- Delete related rows in ReviewLikes
    DELETE FROM ReviewLikes
    WHERE ReviewID = @Review_ID;

    -- Delete the review
    DELETE FROM Reviews
    WHERE Review_ID = @Review_ID;

    SELECT 'Review removed successfully.' AS message;
END;
GO

CREATE PROCEDURE ViewUserProfile
    @User_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the user exists
    IF EXISTS (SELECT 1 FROM [User] WHERE User_ID = @User_ID)
    BEGIN
        -- Retrieve the user's profile details
        SELECT 
            username,
			[password],
            Account_Level,
            email,
            date_of_birth,
            wallet
        FROM [User]
        WHERE User_ID = @User_ID;
    END
    ELSE
    BEGIN
        -- Return a message if the user is not found
        SELECT 
            'User not found' AS message;
    END
END;

GO
-- View to view all games
CREATE VIEW View_All_Games AS 
SELECT Game_ID, Title, [Description], Game_poster, rating, publisher_id, Price, release_date, discount
FROM
    Game_Catalogue;

GO	
CREATE PROCEDURE GetGameReviews
    @GameID INT,
    @UserID INT -- Add UserID as a parameter
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.user_ID,
        r.Review_ID,
        r.Comment,
        r.likes,
        r.Comment_date,
        u.username,
        CASE 
            WHEN rl.UserID IS NOT NULL THEN 1 -- If the user has liked the review
            ELSE 0 -- If the user has not liked the review
        END AS liked
    FROM Reviews r
    JOIN [User] u ON r.user_ID = u.User_ID
    LEFT JOIN ReviewLikes rl ON r.Review_ID = rl.ReviewID AND rl.UserID = @UserID -- Check if the user has liked the review
    WHERE r.game_ID = @GameID
    ORDER BY r.Comment_date DESC; -- Optional: Order by the most recent reviews
END;
GO

-- Procedure to Like a Review
CREATE PROCEDURE LikeReview
    @UserID INT,
    @ReviewID INT
AS
BEGIN
    -- Increment the likes for the review
    UPDATE Reviews
    SET likes = likes + 1
    WHERE Review_ID = @ReviewID;

    -- Track that the user liked the review
    INSERT INTO ReviewLikes (UserID, ReviewID)
    VALUES (@UserID, @ReviewID);
END;
GO

-- Procedure to Dislike a Review
CREATE PROCEDURE DislikeReview
    @UserID INT,
    @ReviewID INT
AS
BEGIN
    -- Decrement the likes for the review
    UPDATE Reviews
    SET likes = likes - 1
    WHERE Review_ID = @ReviewID;

    -- Remove the user's like record
    DELETE FROM ReviewLikes
    WHERE UserID = @UserID AND ReviewID = @ReviewID;
END;
GO

CREATE PROCEDURE UpdateLastPlayed
    @UserID INT,
    @GameID INT
AS
BEGIN
    UPDATE Library
    SET Last_played = GETDATE()
    WHERE User_ID = @UserID AND Game_ID = @GameID;
END;
GO

use project

-- Inserting Users
INSERT INTO [User] (username, password, email, date_of_birth, wallet, account_level, user_profile_image) VALUES
('MasterChief117', 'haloForever', 'chief117@email.com', '1994-03-07', 500, 3, 'halo_avatar.png'),
('KratosGodSlayer', 'boy123', 'kratos@email.com', '1988-05-20', 1000, 5, 'kratos_avatar.png'),
('MarioSpeedRunner', 'itsMeMario', 'mario@email.com', '1990-09-13', 300, 2, 'mario_avatar.png'),
('EzioAuditore', 'hiddenblade', 'ezio@email.com', '1987-06-24', 800, 4, 'ezio_avatar.png'),
('GeraltOfRivia', 'witcher3', 'geralt@email.com', '1985-05-15', 1200, 5, 'geralt_avatar.png'),
('DoomSlayer', 'ripandtear', 'doomslayer@email.com', '1993-08-10', 600, 3, 'doom_avatar.png'),
('LinkHero', 'hyrule2025', 'link@email.com', '1995-03-03', 750, 3, 'link_avatar.png'),
('SolidSnake', 'stealthmode', 'snake@email.com', '1972-06-13', 1300, 4, 'snake_avatar.png'),
('ArthurMorgan', 'outlawlife', 'arthur@email.com', '1863-06-22', 700, 2, 'arthur_avatar.png');

-- Inserting Games
INSERT INTO Game_Catalogue (Title, Description, Game_poster, rating, publisher_id, Price, release_date, discount) VALUES
('Halo Infinite', 'The legendary Master Chief returns in an epic sci-fi shooter.', 'halo_infinite.jpg', 9, 1, 59.99, '2021-12-08', 10),
('God of War Ragnarok', 'Kratos and Atreus embark on a journey through Norse mythology.', 'gow_ragnarok.jpg', 10, 2, 69.99, '2022-11-09', 5),
('The Legend of Zelda: Breath of the Wild', 'Explore a vast open world in this critically acclaimed adventure.', 'zelda_botw.jpg', 10, 3, 49.99, '2017-03-03', 15),
('Assassin''s Creed Valhalla', 'Lead Viking raids and explore Norse mythology.', 'ac_valhalla.jpg', 9, 1, 59.99, '2020-11-10', 10),
('The Witcher 3: Wild Hunt', 'Embark on an epic journey as Geralt in a vast open world.', 'witcher3.jpg', 10, 2, 39.99, '2015-05-19', 20),
('DOOM Eternal', 'Fast-paced demon-slaying action with brutal combat.', 'doom_eternal.jpg', 9, 3, 49.99, '2020-03-20', 15),
('Red Dead Redemption 2', 'A gripping Western adventure with stunning visuals.', 'rdr2.jpg', 10, 1, 69.99, '2018-10-26', 5),
('Elden Ring', 'A dark fantasy RPG with vast exploration and deep lore.', 'elden_ring.jpg', 10, 2, 59.99, '2022-02-25', 10),
('Grand Theft Auto V', 'An open-world crime adventure set in Los Santos.', 'gta_v.jpg', 10, 1, 29.99, '2013-09-17', 5),
('Minecraft', 'A sandbox game where players build and explore infinite worlds.', 'minecraft.jpg', 9, 2, 19.99, '2011-11-18', 10),
('Call of Duty: Modern Warfare II', 'A military shooter with intense combat and multiplayer modes.', 'cod_mw2.jpg', 8, 3, 59.99, '2022-10-28', 15),
('Resident Evil 4 Remake', 'A survival horror classic reimagined with modern graphics.', 're4_remake.jpg', 9, 4, 49.99, '2023-03-24', 10),
('Horizon Forbidden West', 'An action RPG set in a post-apocalyptic world.', 'horizon_fw.jpg', 9, 5, 69.99, '2022-02-18', 5),
('Cyberpunk 2077', 'A futuristic RPG set in the neon-lit Night City.', 'cyberpunk_2077.jpg', 8, 6, 39.99, '2020-12-10', 20),
('Dark Souls III', 'A challenging action RPG with deep lore and intense combat.', 'dark_souls_3.jpg', 9, 7, 49.99, '2016-04-12', 15),
('The Last of Us Part II', 'A gripping narrative-driven survival game.', 'tlou2.jpg', 10, 8, 59.99, '2020-06-19', 5),
('Super Mario Odyssey', 'A colorful platformer featuring Mario’s globe-trotting adventure.', 'mario_odyssey.jpg', 10, 9, 49.99, '2017-10-27', 10);

INSERT INTO Game_Catalogue (Title, Description, Game_poster, rating, publisher_id, Price, release_date, discount) VALUES
('Starfield', 'Explore the galaxy in Bethesda’s new open-world space RPG.', 'starfield.jpg', 8, 4, 69.99, '2023-09-06', 10),
('Death Stranding', 'A mysterious and atmospheric journey across a fractured world.', 'death_stranding.jpg', 8, 11, 49.99, '2019-11-08', 30),
('Resident Evil Village', 'Face gothic horror in the latest installment of the Resident Evil saga.', 're_village.jpg', 9, 1, 59.99, '2021-05-07', 25),
('Ghost of Tsushima', 'An open-world samurai action game set during the Mongol invasion.', 'ghost_tsushima.jpg', 10, 2, 59.99, '2020-07-17', 20),
('Returnal', 'A sci-fi third-person shooter with roguelike elements.', 'returnal.jpg', 8, 2, 69.99, '2021-04-30', 15),
('It Takes Two', 'A unique co-op adventure about love and teamwork.', 'it_takes_two.jpg', 9, 11, 39.99, '2021-03-26', 20),
('Baldur''s Gate 3', 'A deep fantasy RPG based on Dungeons & Dragons.', 'bg3.jpg', 10, 10, 59.99, '2023-08-03', 10),
('Metroid Dread', 'Samus Aran returns in a high-speed 2D platformer.', 'metroid_dread.jpg', 9, 3, 59.99, '2021-10-08', 10),
('Splatoon 3', 'Team up in colorful, fast-paced online ink battles.', 'splatoon3.jpg', 8, 3, 59.99, '2022-09-09', 5),
('Alan Wake II', 'A psychological horror sequel with mind-bending storytelling.', 'alan_wake_2.jpg', 9, 5, 59.99, '2023-10-27', 10);

-- Inserting Reviews
INSERT INTO Reviews (user_ID, game_ID, Comment, Comment_date, likes) VALUES
( 1, 1, 'Halo Infinite brings back the classic feel with modern mechanics!', '2024-01-05', 50),
( 2, 2, 'Ragnarok is a masterpiece—storytelling and combat are top-notch.', '2023-07-20', 100),
( 3, 3, 'Breath of the Wild redefines open-world exploration.', '2024-02-11', 75),
( 1, 4, 'Valhalla is a fantastic Viking experience!', '2024-03-15', 40),
( 2, 5, 'The Witcher 3 is still the best RPG ever made.', '2024-02-10', 80),
( 3, 6, 'DOOM Eternal is pure adrenaline!', '2024-01-25', 60),
( 1, 7, 'RDR2 has the best storytelling in gaming history.', '2024-04-05', 90),
( 2, 8, 'Elden Ring is a masterpiece of world-building.', '2024-04-10', 100),
( 1, 9, 'GTA V is still one of the best open-world games ever!', '2024-04-15', 120),
( 2, 10, 'Minecraft is timeless—endless creativity!', '2024-04-16', 200),
( 3, 11, 'MW2 multiplayer is insanely fun!', '2024-04-17', 90),
( 4, 12, 'Resident Evil 4 Remake is a perfect reimagining!', '2024-04-18', 150),
( 5, 13, 'Horizon Forbidden West is visually stunning!', '2024-04-19', 80),
( 6, 14, 'Cyberpunk 2077 has improved a lot since launch.', '2024-04-20', 110),
( 7, 15, 'Dark Souls III is brutally difficult but rewarding.', '2024-04-21', 95),
( 8, 16, 'The Last of Us Part II has an emotional story.', '2024-04-22', 130),
( 9, 17, 'Super Mario Odyssey is pure joy!', '2024-04-23', 140),
( 9, 8, 'Elden Ring is a masterpiece!', '2024-04-24', 180);

-- Inserting Cart Data
-- Updated Cart entries (Games are fully distributed)
INSERT INTO Cart (UserID, GameID, Game_Count) VALUES
(1, 1, 1), (1, 4, 1), (1, 7, 1), (1, 9, 1), (1, 14, 1),
(2, 2, 1), (2, 5, 1), (2, 8, 1), (2, 10, 1),
(3, 3, 2), (3, 6, 1), (3, 11, 1), (3, 15, 1),
(4, 5, 1), (4, 12, 1), (4, 17, 1),
(5, 13, 1), (5, 1, 1), (5, 9, 1),
(6, 14, 1), (6, 2, 1), (6, 4, 1),
(7, 15, 1), (7, 7, 1), (7, 5, 1),
(8, 16, 1), (8, 6, 1), (8, 10, 1),
(9, 17, 1), (9, 8, 1), (9, 13, 1);

-- Inserting Library Data
INSERT INTO Library (User_ID, game_ID, Purchase_date, Last_played, Play_time) VALUES
(1, 1, '2023-11-15', '2024-04-19', 120),
(1, 4, '2023-12-20', '2024-04-18', 160),
(1, 7, '2024-01-10', '2024-04-15', 300),
(1, 9, '2024-02-10', '2024-04-14', 220),
(1, 14,'2024-03-01', '2024-04-13', 110),

(2, 2, '2024-01-15', '2024-04-17', 240),
(2, 5, '2024-01-22', '2024-04-14', 100),
(2, 8, '2024-02-15', '2024-04-16', 330),
(2, 10, '2024-03-05', '2024-04-15', 180),

(3, 3, '2024-01-10', '2024-04-18', 360),
(3, 6, '2024-02-01', '2024-04-17', 400),
(3, 11, '2024-02-20', '2024-04-16', 280),

(4, 12, '2024-01-20', '2024-04-12', 180),
(4, 17, '2024-03-10', '2024-04-11', 220),

(5, 13, '2024-02-05', '2024-04-10', 140),
(5, 1, '2024-02-10', '2024-04-09', 160),
(5, 9, '2024-02-15', '2024-04-08', 120),

(6, 2,'2024-03-10', '2024-04-09', 100),
(6, 4, '2024-03-20', '2024-04-08', 130),

(7, 5, '2024-02-05', '2024-04-06', 210),
(7, 7, '2024-02-15', '2024-04-05', 190),
(7, 15, '2024-01-25', '2024-04-07', 250),

(8, 16, '2024-03-05', '2024-04-04', 270),
(8, 10, '2024-03-15', '2024-04-03', 150),

(9 , 8 , '2023-07-18' , '2024-12-15' , 490),
(9, 17, '2024-03-25', '2024-04-02', 130),
(9, 13, '2024-04-01', '2024-04-01', 90);


-- Inserting System Requirements
INSERT INTO System_Requirements (Game_ID, Processor, Gpu, Ram, Storage, OS, DXD3_version) VALUES
(1, 'Intel i7-9700K', 'RTX 2080', '16GB', '50GB SSD', 'Windows 11', 'DX12'),
(2, 'AMD Ryzen 5 5600X', 'RX 6700 XT', '16GB', '45GB SSD', 'Windows 10', 'DX12'),
(3, 'Intel i5-9600K', 'GTX 1660 Ti', '8GB', '30GB HDD', 'Windows 10', 'DX11'),
(4, 'Intel i9-9900K', 'RTX 3080', '32GB', '80GB SSD', 'Windows 11', 'DX12'),
(5, 'AMD Ryzen 7 5800X', 'RX 6800 XT', '16GB', '50GB SSD', 'Windows 10', 'DX12'),
(6, 'Intel i7-10700K', 'RTX 2070 Super', '16GB', '55GB SSD', 'Windows 10', 'DX12'),
(7, 'AMD Ryzen 9 5900X', 'RTX 3090', '32GB', '120GB SSD', 'Windows 11', 'DX12'),
(8, 'Intel i5-10600K', 'GTX 1660 Super', '16GB', '60GB SSD', 'Windows 10', 'DX12'),
(9,  'Intel i5-3470', 'GTX 660', '8GB',  '65GB HDD','Windows 7 64-bit', 'DX11'),
(10, 'Intel i3-3210', 'Intel HD 4000', '4GB',  '1GB', 'Windows 7+', 'DX11'),
(11, 'Intel i3-6100', 'GTX 960','8GB',  '125GB SSD', 'Windows 10 64-bit', 'DX12'),
(12, 'Intel i5-7500', 'GTX 1050 Ti', '8GB', '50GB SSD', 'Windows 10 64-bit', 'DX12'),
(13, 'Intel i5-8400', 'GTX 1060 6GB','16GB', '70GB SSD', 'Windows 10 64-bit', 'DX12'),
(14, 'Intel i7-6700', 'GTX 1060 6GB', '12GB', '70GB SSD', 'Windows 10 64-bit', 'DX12'),
(15, 'Intel i3-2100', 'GTX 750 Ti', '8GB', '25GB HDD', 'Windows 7 64-bit', 'DX11'),
(16, 'Intel i5-6600K','GTX 970', '8GB', '100GB SSD', 'Windows 10 64-bit', 'DX12'),
(17, 'Intel i5-4430', 'GTX 660', '8GB', '5.6GB SSD', 'Windows 10', 'DX11');

-- test procedure update user profile
EXEC UpdateUserProfile 
    @User_ID = 1,
    @NewUsername = 'MasterChief118',
    @NewPassword = NULL,
    @NewEmail = NULL,
    @NewProfileImage = NULL;


-- test procedure add funds to wallet
EXEC AddFundsToWallet @UserID = 10, @Amount = 100;

-- test procedure removing game from cart
EXEC RemoveGameFromCart @User_ID = 1, @Game_ID = 10;

-- test procedure to view user's purchase history
EXEC ViewPurchaseHistory @User_ID = 1;

-- test procedure to remove a review
EXEC RemoveReview @Review_ID = 1;

-- test view to view all games
select * from View_All_Games


select * from Game_Catalogue
select * from [User]
select * from System_Requirements
select * from Library
select * from Cart where USERID = 1;
select * from Reviews where user_id = 1

drop table [User]
drop table Game_Catalogue
drop table reviews 
drop table System_Requirements
drop table library

drop table cart
Delete from Library where USER_ID = 10