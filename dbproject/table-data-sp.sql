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
    Review_ID INT PRIMARY KEY,
    user_ID INT,
    game_ID INT,
    Comment VARCHAR(500),
    Comment_date DATE NOT NULL,
    likes INT DEFAULT 0,
    FOREIGN KEY (user_ID) REFERENCES [User](User_ID),
    FOREIGN KEY (game_ID) REFERENCES Game_Catalogue(Game_ID)
);

CREATE TABLE Cart (
    Cart_ID INT PRIMARY KEY,
    UserID INT,
    GameID INT,
    Game_Count INT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES [User](User_ID),
    FOREIGN KEY (GameID) REFERENCES Game_Catalogue(Game_ID)
);

CREATE TABLE Library (
    User_ID INT PRIMARY KEY,
    game_ID INT,
    Total_Games INT DEFAULT 0,
    Purchase_date DATE NOT NULL,
    Last_played DATE NOT NULL,
    Play_time INT NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES [User](User_ID),
    FOREIGN KEY (game_ID) REFERENCES Game_Catalogue(Game_ID)
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

-- Login Procedure
CREATE PROCEDURE Login
    @username VARCHAR(255),
    @password VARCHAR(255)
AS
BEGIN
    SELECT User_ID FROM [User]
    WHERE username = @username AND password = @password;
END;

-- User Library View
CREATE PROCEDURE Library_view
@username VARCHAR(255)
AS
begin
SELECT L.User_ID, G.Game_ID, G.Title, G.Description
FROM Library L
JOIN Game_Catalogue G ON L.game_ID = G.Game_ID 
where L.User_ID = @username;
end

-- Search Procedure by Rating, Publisher, Price
CREATE PROCEDURE Search_Game
    @rating INT = NULL, @publisher_id INT = NULL, @price DECIMAL(10,2) = NULL
AS
BEGIN
    SELECT * FROM Game_Catalogue
    WHERE (@rating IS NULL OR rating = @rating)
      AND (@publisher_id IS NULL OR publisher_id = @publisher_id)
      AND (@price IS NULL OR Price <= @price);
END;

-- Purchase Procedure
CREATE PROCEDURE Purchase
    @userID INT,
    @gameID INT
AS
BEGIN
    DECLARE @gamePrice DECIMAL(10,2), @userWallet INT;
    SELECT @gamePrice = Price FROM Game_Catalogue WHERE Game_ID = @gameID;
    SELECT @userWallet = wallet FROM [User] WHERE User_ID = @userID;
    
    IF @userWallet >= @gamePrice
    BEGIN
        UPDATE [User] SET wallet = wallet - @gamePrice WHERE User_ID = @userID;
        INSERT INTO Library (User_ID, game_ID, Purchase_date, Last_played, Play_time)
        VALUES (@userID, @gameID, GETDATE(), GETDATE(), 0);
    END
END;


-- add to cart
CREATE PROCEDURE AddToCart
    @UserID INT,
    @GameID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Cart WHERE UserID = @UserID AND GameID = @GameID)
    BEGIN
        UPDATE Cart
        SET Game_Count = Game_Count + 1
        WHERE UserID = @UserID AND GameID = @GameID;
    END
    ELSE
    BEGIN
        INSERT INTO Cart (UserID, GameID, Game_Count)
        VALUES (@UserID, @GameID, 1);
    END
END;

-- view the details of a game in store
CREATE PROCEDURE ViewGameDetails
    @GameID INT
AS
BEGIN
    SELECT *
    FROM Game_Catalogue
    WHERE Game_ID = @GameID;
END;

-- for adding review of a ggame 
CREATE PROCEDURE AddReview
    @UserID INT,
    @GameID INT,
    @Comment VARCHAR(500),
    @CommentDate DATE
AS
BEGIN
    INSERT INTO Reviews (user_ID, game_ID, Comment, Comment_date)
    VALUES (@UserID, @GameID, @Comment, @CommentDate);
END;

INSERT INTO [User] (username, password, email, date_of_birth) VALUES ('publisher1', 'pass123', 'publisher1@example.com', '1990-01-01');


INSERT INTO Game_Catalogue (Title, Description, Game_poster, rating, publisher_id, Price, release_date, discount) VALUES ('Cyber Racer', 'Futuristic racing game with immersive graphics', 'cyber_racer.jpg', 9, 1, 29.99, '2025-05-10', 5.00);
