USE [PEP-NK]
GO
/****** Object:  Schema [PEP]    Script Date: 28/11/2025 09:12:24 ******/
CREATE SCHEMA [PEP]
GO
/****** Object:  Table [PEP].[Staff]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[Staff](
	[StaffId] [int] NOT NULL,
	[EmployeeEpicId] [nvarchar](50) NULL,
	[Name] [nvarchar](300) NOT NULL,
	[Email] [nvarchar](550) NOT NULL,
	[ADLogin] [nvarchar](128) NULL,
 CONSTRAINT [PK_Staff] PRIMARY KEY CLUSTERED 
(
	[StaffId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [PEP].[StaffDomainAccess]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[StaffDomainAccess](
	[StaffID] [int] NOT NULL,
	[IsAdministrator] [bit] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [PEP].[Surveys]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[Surveys](
	[SurveyId] [int] IDENTITY(1,1) NOT NULL,
	[SurveyCode]  AS ('S'+right('000000'+CONVERT([varchar](6),[SurveyId]),(6))) PERSISTED,
	[SurveyName] [nvarchar](255) NOT NULL,
    [Description] [nvarchar](max) NULL,
    [PublishedUrlGuid] [uniqueidentifier] NOT NULL CONSTRAINT [DF_Surveys_PublishedUrlGuid] DEFAULT (NEWID()),
	[CreatedAt] [datetime2](7) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[UpdatedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[SurveyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [PEP].[SurveyStatus]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[SurveyStatus](
	[StatusId] [int] NOT NULL,
	[StatusName] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[StatusId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [PEP].[SurveyVersions]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[SurveyVersions](
	[SurveyVersionId] [int] IDENTITY(1,1) NOT NULL,
	[SurveyId] [int] NOT NULL,
	[VersionNumber] [int] NOT NULL,
	[SurveySchemaJson] [nvarchar](max) NOT NULL,
	[StatusId] [int] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[ApprovedAt] [datetime2](7) NULL,
	[ApprovedBy] [int] NULL,
	[PublishedAt] [datetime2](7) NULL,
	[PublishedBy] [int] NULL,
	[RetiredAt] [datetime2](7) NULL,
	[RetiredBy] [int] NULL,
	[ChangeNotes] [nvarchar](max) NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[UpdatedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[SurveyVersionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_SurveyVersions_SurveyId_VersionNumber] UNIQUE NONCLUSTERED 
(
	[SurveyId] ASC,
	[VersionNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [PEP].[SurveySubmissions](
    [SurveySubmissionId] [int] IDENTITY(1,1) NOT NULL,
    [SurveyId] [int] NOT NULL,
    [SurveyVersionId] [int] NOT NULL,
    [SubmittedBy] [nvarchar](255) NULL,
    [SubmittedAt] [datetime2](7) NOT NULL CONSTRAINT [DF_SurveySubmissions_SubmittedAt] DEFAULT (getutcdate()),
    [SubmittedIpAddress] [nvarchar](64) NULL,
    [Submission] [nvarchar](max) NOT NULL,
    CONSTRAINT [PK_SurveySubmissions] PRIMARY KEY CLUSTERED ([SurveySubmissionId] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [PEP].[StaffDomainAccess] ADD  DEFAULT ((0)) FOR [IsAdministrator]
GO
ALTER TABLE [PEP].[SurveyVersions] ADD  DEFAULT ((1)) FOR [StatusId]
GO
ALTER TABLE [PEP].[SurveyVersions] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [PEP].[Surveys]  WITH CHECK ADD  CONSTRAINT [FK_Surveys_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[Surveys] CHECK CONSTRAINT [FK_Surveys_CreatedBy]
GO
ALTER TABLE [PEP].[Surveys]  WITH CHECK ADD  CONSTRAINT [FK_Surveys_UpdatedBy] FOREIGN KEY([UpdatedBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[Surveys] CHECK CONSTRAINT [FK_Surveys_UpdatedBy]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_ApprovedBy]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_CreatedBy]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_PublishedBy] FOREIGN KEY([PublishedBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_PublishedBy]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_RetiredBy] FOREIGN KEY([RetiredBy])
REFERENCES [PEP].[Staff] ([StaffId])
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_RetiredBy]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_Status] FOREIGN KEY([StatusId])
REFERENCES [PEP].[SurveyStatus] ([StatusId])
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_Status]
GO
ALTER TABLE [PEP].[SurveyVersions]  WITH CHECK ADD  CONSTRAINT [FK_SurveyVersions_Surveys] FOREIGN KEY([SurveyId])
REFERENCES [PEP].[Surveys] ([SurveyId])
ON DELETE CASCADE
GO
ALTER TABLE [PEP].[SurveyVersions] CHECK CONSTRAINT [FK_SurveyVersions_Surveys]
GO
ALTER TABLE [PEP].[SurveySubmissions]  WITH CHECK ADD  CONSTRAINT [FK_SurveySubmissions_Surveys] FOREIGN KEY([SurveyId])
REFERENCES [PEP].[Surveys] ([SurveyId])
ON DELETE CASCADE
GO
ALTER TABLE [PEP].[SurveySubmissions] CHECK CONSTRAINT [FK_SurveySubmissions_Surveys]
GO
ALTER TABLE [PEP].[SurveySubmissions]  WITH CHECK ADD  CONSTRAINT [FK_SurveySubmissions_SurveyVersions] FOREIGN KEY([SurveyVersionId])
REFERENCES [PEP].[SurveyVersions] ([SurveyVersionId])
ON DELETE CASCADE
GO
ALTER TABLE [PEP].[SurveySubmissions] CHECK CONSTRAINT [FK_SurveySubmissions_SurveyVersions]
GO
/****** Object:  StoredProcedure [PEP].[CreateNewSurvey]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- CreateNewSurvey: Creates a new survey with its first draft version
CREATE   PROCEDURE [PEP].[CreateNewSurvey]
    @SurveyName NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @SurveySchemaJson NVARCHAR(MAX),
    @CreatedBy INT,
    @SurveyId INT OUTPUT,
    @VersionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Insert the new survey
        INSERT INTO [PEP].[Surveys] (
            SurveyName,
            [Description],
            PublishedUrlGuid,
            CreatedAt,
            CreatedBy
        )
        VALUES (
            @SurveyName,
            @Description,
            NEWID(),
            GETUTCDATE(),
            @CreatedBy
        );
        
        -- Get the generated survey ID
        SET @SurveyId = SCOPE_IDENTITY();

        -- Insert the first version (Draft status = 1, IsActive = 1)
        INSERT INTO [PEP].[SurveyVersions] (
            SurveyId,
            VersionNumber,
            SurveySchemaJson,
            StatusId,
            CreatedAt,
            CreatedBy
        )
        VALUES (
            @SurveyId,
            1, -- First version
            @SurveySchemaJson,
            100, -- Draft status
            GETUTCDATE(),
            @CreatedBy
        );

        -- Get the generated version ID
        SET @VersionId = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [PEP].[CreateSurveyVersion]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- CreateSurveyVersion: Adds a new draft version to an existing survey
CREATE   PROCEDURE [PEP].[CreateSurveyVersion]
    @SurveyId INT,
    @SurveySchemaJson NVARCHAR(MAX),
    @ChangeNotes NVARCHAR(MAX) = NULL,
    @CreatedBy INT,
    @VersionId INT OUTPUT,
    @VersionNumber INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if survey exists
    --IF NOT EXISTS (SELECT 1 FROM [PEP].[Surveys] WHERE SurveyId = @SurveyId)
    --BEGIN
    --    RAISERROR('Survey not found', 16, 1);
    --    RETURN;
    --END

    -- Get the next version number
    SELECT @VersionNumber = ISNULL(MAX(VersionNumber), 0) + 1
    FROM [PEP].[SurveyVersions]
    WHERE SurveyId = @SurveyId;

    -- Insert new version (Draft status = 100)
    INSERT INTO [PEP].[SurveyVersions] (
        SurveyId,
        VersionNumber,
        SurveySchemaJson,
        StatusId,
        CreatedAt,
        CreatedBy,
        ChangeNotes
    )
    VALUES (
        @SurveyId,
        @VersionNumber,
        @SurveySchemaJson,
        100, -- Draft status
        GETUTCDATE(),
        @CreatedBy,
        @ChangeNotes
    );

    -- Get the generated ID
    SET @VersionId = SCOPE_IDENTITY();

END
GO
/****** Object:  StoredProcedure [PEP].[CreateSurveySubmission]    Script Date: 01/12/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [PEP].[CreateSurveySubmission]
    @SurveyId INT,
    @SurveyVersionId INT,
    @SubmittedBy NVARCHAR(255) = NULL,
    @SubmittedIpAddress NVARCHAR(64) = NULL,
    @Submission NVARCHAR(MAX),
    @SubmissionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [PEP].[SurveySubmissions]
    (
        SurveyId,
        SurveyVersionId,
        SubmittedBy,
        SubmittedIpAddress,
        Submission
    )
    VALUES
    (
        @SurveyId,
        @SurveyVersionId,
        @SubmittedBy,
        @SubmittedIpAddress,
        @Submission
    );

    SET @SubmissionId = SCOPE_IDENTITY();
END
GO
/****** Object:  StoredProcedure [PEP].[GetAllSurveys]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [PEP].[GetAllSurveys]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        s.SurveyId,
        s.SurveyCode,
        s.SurveyName,
        s.Description,
        s.PublishedUrlGuid,
        s.CreatedAt,
        s.CreatedBy,
        cs.Name AS CreatedByName,
        cs.Email AS CreatedByEmail,
        s.UpdatedAt,
        s.UpdatedBy,
        us.Name AS UpdatedByName,
        us.Email AS UpdatedByEmail
    FROM 
        [PEP].[Surveys] s
        LEFT JOIN [PEP].[Staff] cs ON s.CreatedBy = cs.StaffId
        LEFT JOIN [PEP].[Staff] us ON s.UpdatedBy = us.StaffId
    ORDER BY 
        s.UpdatedAt DESC, s.CreatedAt DESC;
END
GO
/****** Object:  StoredProcedure [PEP].[GetStaff]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [PEP].[GetStaff] 
AS
BEGIN

SET NOCOUNT ON;

SELECT StaffId,
       Name,
       Email,
       ADLogin FROM PEP.Staff

END
GO
/****** Object:  StoredProcedure [PEP].[GetStaffMemberAccess]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [PEP].[GetStaffMemberAccess]
    @StaffID INT = NULL,
    @User NVARCHAR(255) = NULL
AS
BEGIN

    SET NOCOUNT ON;

    SELECT sda.StaffID,
           s.[Name] StaffName,
           sda.IsAdministrator
    FROM PEP.StaffDomainAccess sda
        INNER JOIN PEP.Staff s
            ON s.StaffId = sda.StaffID
    WHERE (
              sda.StaffID = @StaffID
              OR @StaffID IS NULL
          )
          AND
          (
              s.Email = @User
              OR @User IS NULL
          );

END;
GO
/****** Object:  StoredProcedure [PEP].[GetSurvey]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [PEP].[GetSurvey]
    @SurveyId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- First result set: Survey header information
    SELECT 
        s.SurveyId,
        s.SurveyCode,
        s.SurveyName,
        s.Description,
        s.PublishedUrlGuid,
        s.CreatedAt,
        s.CreatedBy,
        cs.Name AS CreatedByName,
        cs.Email AS CreatedByEmail,
        s.UpdatedAt,
        s.UpdatedBy,
        us.Name AS UpdatedByName,
        us.Email AS UpdatedByEmail
    FROM 
        [PEP].[Surveys] s
        INNER JOIN [PEP].[Staff] cs ON s.CreatedBy = cs.StaffId
        LEFT JOIN [PEP].[Staff] us ON s.UpdatedBy = us.StaffId
    WHERE 
        s.SurveyId = @SurveyId;

    -- Second result set: All versions for this survey
    SELECT 
        sv.SurveyVersionId,
        sv.SurveyId,
        sv.VersionNumber,
        sv.SurveySchemaJson,
        sv.StatusId,
        ss.StatusName,
        sv.CreatedAt,
        sv.CreatedBy,
        cs.Name AS CreatedByName,
        cs.Email AS CreatedByEmail,
        sv.ApprovedAt,
        sv.ApprovedBy,
        aps.Name AS ApprovedByName,
        aps.Email AS ApprovedByEmail,
        sv.PublishedAt,
        sv.PublishedBy,
        pbs.Name AS PublishedByName,
        pbs.Email AS PublishedByEmail,
        sv.RetiredAt,
        sv.RetiredBy,
        rts.Name AS RetiredByName,
        rts.Email AS RetiredByEmail,
        sv.ChangeNotes,
        sv.UpdatedAt,
        sv.UpdatedBy,
        us.Name AS UpdatedByName,
        us.Email AS UpdatedByEmail
    FROM 
        [PEP].[SurveyVersions] sv
        INNER JOIN [PEP].[SurveyStatus] ss ON sv.StatusId = ss.StatusId
        INNER JOIN [PEP].[Staff] cs ON sv.CreatedBy = cs.StaffId
        LEFT JOIN [PEP].[Staff] aps ON sv.ApprovedBy = aps.StaffId
        LEFT JOIN [PEP].[Staff] pbs ON sv.PublishedBy = pbs.StaffId
        LEFT JOIN [PEP].[Staff] rts ON sv.RetiredBy = rts.StaffId
        LEFT JOIN [PEP].[Staff] us ON sv.UpdatedBy = us.StaffId
    WHERE 
        sv.SurveyId = @SurveyId
    ORDER BY 
         sv.SurveyVersionId DESC;
END
GO
/****** Object:  StoredProcedure [PEP].[GetSurveyByPublishedGuid]    Script Date: 01/12/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [PEP].[GetSurveyByPublishedGuid]
    @PublishedUrlGuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- First result set: Survey header information
    SELECT 
        s.SurveyId,
        s.SurveyCode,
        s.SurveyName,
        s.Description,
        s.PublishedUrlGuid,
        s.CreatedAt,
        s.CreatedBy,
        cs.Name AS CreatedByName,
        cs.Email AS CreatedByEmail,
        s.UpdatedAt,
        s.UpdatedBy,
        us.Name AS UpdatedByName,
        us.Email AS UpdatedByEmail
    FROM 
        [PEP].[Surveys] s
        INNER JOIN [PEP].[Staff] cs ON s.CreatedBy = cs.StaffId
        LEFT JOIN [PEP].[Staff] us ON s.UpdatedBy = us.StaffId
    WHERE 
        s.PublishedUrlGuid = @PublishedUrlGuid;

    -- Second result set: All versions for this survey
    SELECT 
        sv.SurveyVersionId,
        sv.SurveyId,
        sv.VersionNumber,
        sv.SurveySchemaJson,
        sv.StatusId,
        ss.StatusName,
        sv.CreatedAt,
        sv.CreatedBy,
        cs.Name AS CreatedByName,
        cs.Email AS CreatedByEmail,
        sv.ApprovedAt,
        sv.ApprovedBy,
        aps.Name AS ApprovedByName,
        aps.Email AS ApprovedByEmail,
        sv.PublishedAt,
        sv.PublishedBy,
        pbs.Name AS PublishedByName,
        pbs.Email AS PublishedByEmail,
        sv.RetiredAt,
        sv.RetiredBy,
        rts.Name AS RetiredByName,
        rts.Email AS RetiredByEmail,
        sv.ChangeNotes,
        sv.UpdatedAt,
        sv.UpdatedBy,
        us.Name AS UpdatedByName,
        us.Email AS UpdatedByEmail
    FROM 
        [PEP].[SurveyVersions] sv
        INNER JOIN [PEP].[SurveyStatus] ss ON sv.StatusId = ss.StatusId
        INNER JOIN [PEP].[Surveys] s ON sv.SurveyId = s.SurveyId
        INNER JOIN [PEP].[Staff] cs ON sv.CreatedBy = cs.StaffId
        LEFT JOIN [PEP].[Staff] aps ON sv.ApprovedBy = aps.StaffId
        LEFT JOIN [PEP].[Staff] pbs ON sv.PublishedBy = pbs.StaffId
        LEFT JOIN [PEP].[Staff] rts ON sv.RetiredBy = rts.StaffId
        LEFT JOIN [PEP].[Staff] us ON sv.UpdatedBy = us.StaffId
    WHERE 
        s.PublishedUrlGuid = @PublishedUrlGuid
    ORDER BY 
         sv.SurveyVersionId DESC;
END
GO
/****** Object:  StoredProcedure [PEP].[UpdateSurvey]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- UpdateSurvey: Updates survey metadata (name, description)
CREATE   PROCEDURE [PEP].[UpdateSurvey]
    @SurveyId INT,
    @SurveyName NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @UpdatedBy INT
AS
BEGIN
    SET NOCOUNT ON;

    ---- Check if survey exists
    --IF NOT EXISTS (SELECT 1 FROM [PEP].[Surveys] WHERE SurveyId = @SurveyId)
    --BEGIN
    --    RAISERROR('Survey not found', 16, 1);
    --    RETURN;
    --END

    -- Update the survey
    UPDATE [PEP].[Surveys]
    SET 
        SurveyName = @SurveyName,
        Description = @Description,
        UpdatedAt = GETUTCDATE(),
        UpdatedBy = @UpdatedBy
    WHERE SurveyId = @SurveyId;
END
GO
/****** Object:  StoredProcedure [PEP].[UpdateSurveyVersion]    Script Date: 01/12/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [PEP].[UpdateSurveyVersion]
    @SurveyVersionId INT,
    @SurveyId INT,
    @VersionNumber INT,
    @SurveySchemaJson NVARCHAR(MAX),
    @StatusId INT,
    @CreatedAt DATETIME2(7),
    @CreatedBy INT,
    @ApprovedAt DATETIME2(7) = NULL,
    @ApprovedBy INT = NULL,
    @PublishedAt DATETIME2(7) = NULL,
    @PublishedBy INT = NULL,
    @RetiredAt DATETIME2(7) = NULL,
    @RetiredBy INT = NULL,
    @ChangeNotes NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2(7) = NULL,
    @UpdatedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [PEP].[SurveyVersions]
    SET
        SurveyId = @SurveyId,
        VersionNumber = @VersionNumber,
        SurveySchemaJson = @SurveySchemaJson,
        StatusId = @StatusId,
        CreatedAt = @CreatedAt,
        CreatedBy = @CreatedBy,
        ApprovedAt = @ApprovedAt,
        ApprovedBy = @ApprovedBy,
        PublishedAt = @PublishedAt,
        PublishedBy = @PublishedBy,
        RetiredAt = @RetiredAt,
        RetiredBy = @RetiredBy,
        ChangeNotes = @ChangeNotes,
        UpdatedAt = @UpdatedAt,
        UpdatedBy = @UpdatedBy
    WHERE SurveyVersionId = @SurveyVersionId;
END
GO
/****** Object:  StoredProcedure [PEP].[UpdateSurveySchema]    Script Date: 28/11/2025 09:12:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- UpdateSurveySchema: Updates the schema of a draft survey version
CREATE   PROCEDURE [PEP].[UpdateSurveySchema]
    @SurveyId INT,
    @VersionId INT,
    @SurveySchemaJson NVARCHAR(MAX),
    @ChangeNotes NVARCHAR(MAX) = NULL,
    @UpdatedBy INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the version exists and belongs to the survey
    IF NOT EXISTS (
        SELECT 1 
        FROM [PEP].[SurveyVersions]
        WHERE SurveyVersionId = @VersionId 
        AND SurveyId = @SurveyId
    )
    BEGIN
        RAISERROR('Survey version not found or does not belong to the specified survey.', 16, 1);
        RETURN;
    END

    -- Check if the version is in Draft status (StatusId = 1)
    DECLARE @StatusId INT;
    SELECT @StatusId = StatusId 
    FROM [PEP].[SurveyVersions]
    WHERE SurveyVersionId = @VersionId;

    -- Update the survey version
    UPDATE [PEP].[SurveyVersions]
    SET 
        SurveySchemaJson = @SurveySchemaJson,
        ChangeNotes = @ChangeNotes,
        UpdatedAt = GETUTCDATE(),
        UpdatedBy = @UpdatedBy
    WHERE SurveyVersionId = @VersionId;

    -- Update the survey's UpdatedAt and UpdatedBy
    UPDATE [PEP].[Surveys]
    SET 
        UpdatedAt = GETUTCDATE(),
        UpdatedBy = @UpdatedBy
    WHERE SurveyId = @SurveyId;

END
GO



-- Insert survey status values
INSERT INTO [PEP].[SurveyStatus] ([StatusId], [StatusName], [Description]) VALUES
(100, 'Draft', 'Survey version is being created or edited'),
(200, 'Approved', 'Survey version has been approved but not yet published'),
(300, 'Published', 'Survey version is currently active and available for use'),
(400, 'Retired', 'Survey version is no longer active');
GO
