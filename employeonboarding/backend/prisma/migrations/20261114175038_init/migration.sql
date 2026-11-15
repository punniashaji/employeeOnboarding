BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    [email] NVARCHAR(100) NOT NULL,
    [password] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(10) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'user',
    [isApproved] BIT NOT NULL CONSTRAINT [User_isApproved_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    [email] NVARCHAR(100) NOT NULL,
    [mobile] NVARCHAR(10) NOT NULL,
    [dob] DATE NOT NULL,
    [department] NVARCHAR(50) NOT NULL,
    [designation] NVARCHAR(50) NOT NULL,
    [joiningDate] DATE NOT NULL,
    [address] NVARCHAR(250) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Employee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employee_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Qualification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [qualification] NVARCHAR(100) NOT NULL,
    [university] NVARCHAR(100) NOT NULL,
    [yearOfPassing] INT NOT NULL,
    [score] FLOAT(53) NOT NULL,
    [employeeId] INT NOT NULL,
    CONSTRAINT [Qualification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Experience] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company] NVARCHAR(100) NOT NULL,
    [designation] NVARCHAR(50) NOT NULL,
    [fromDate] DATE NOT NULL,
    [toDate] DATE NOT NULL,
    [employeeId] INT NOT NULL,
    CONSTRAINT [Experience_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Document] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(20) NOT NULL,
    [originalName] NVARCHAR(255) NOT NULL,
    [storedName] NVARCHAR(100) NOT NULL,
    [mimeType] NVARCHAR(100) NOT NULL,
    [size] INT NOT NULL,
    [uploadedAt] DATETIME2 NOT NULL CONSTRAINT [Document_uploadedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [employeeId] INT NOT NULL,
    [experienceId] INT,
    CONSTRAINT [Document_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Qualification] ADD CONSTRAINT [Qualification_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Experience] ADD CONSTRAINT [Experience_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_experienceId_fkey] FOREIGN KEY ([experienceId]) REFERENCES [dbo].[Experience]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
