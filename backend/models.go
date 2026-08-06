package main

import "time"

type Model struct {
	CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

type Merchant struct {
	ID         string `gorm:"primaryKey"`
	Name       string
	Subtitle   string
	Pinyin     string
	Location   string
	DistanceKM float64
	SortOrder  int
	Model
	Packages []Package `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Package struct {
	ID            string   `gorm:"primaryKey"`
	MerchantID    string   `gorm:"not null;index"`
	Merchant      Merchant `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Title         string
	CoverImage    string
	Price         float64
	Points        int
	Tag           string
	Gifts         string `gorm:"type:jsonb"`
	PackageImages string `gorm:"type:jsonb"`
	Tone          string
	Contents      string `gorm:"type:jsonb"`
	Notices       string `gorm:"type:jsonb"`
	SortOrder     int
	Model
}

type Order struct {
	ID         string  `gorm:"primaryKey"`
	PackageID  string  `gorm:"not null;index"`
	Package    Package `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID     string  `gorm:"index"`
	User       Profile `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	OrderNo    string  `gorm:"not null;uniqueIndex"`
	Status     string  `gorm:"not null"`
	VerifiedAt *time.Time
	Model
}

type Profile struct {
	ID        string  `gorm:"primaryKey"`
	OpenID    *string `gorm:"index"`
	Nickname  string
	Avatar    string
	Phone     string
	Points    int
	Coupons   int
	Favorites int
	Model
}

func (Profile) TableName() string { return "profile" }

type DailyCheckIn struct {
	ID          string    `gorm:"primaryKey"`
	UserID      string    `gorm:"not null;uniqueIndex:idx_daily_check_ins_user_date"`
	User        Profile   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CheckInDate time.Time `gorm:"type:date;not null;uniqueIndex:idx_daily_check_ins_user_date"`
	Points      int       `gorm:"not null"`
	Model
}

type UserAddress struct {
	ID           string  `gorm:"primaryKey"`
	UserID       string  `gorm:"not null;uniqueIndex"`
	User         Profile `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Province     string  `gorm:"not null"`
	City         string  `gorm:"not null"`
	District     string  `gorm:"not null"`
	Detail       string  `gorm:"not null"`
	ContactName  string  `gorm:"not null"`
	ContactPhone string  `gorm:"not null"`
	Model
}

type PointRecord struct {
	ID         string  `gorm:"primaryKey"`
	UserID     string  `gorm:"index"`
	User       Profile `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Title      string
	OccurredAt time.Time
	Change     int
	Model
}
type Coupon struct {
	ID           string  `gorm:"primaryKey"`
	UserID       string  `gorm:"index"`
	User         Profile `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	RedemptionID string  `gorm:"index"`
	Value        float64
	Title        string
	Note         string
	DateText     string
	Status       string
	State        string
	SortOrder    int
	Model
}

type PointsCategory struct {
	ID        string `gorm:"primaryKey"`
	Label     string `gorm:"not null"`
	Emoji     string
	Image     string
	SortOrder int
	Active    bool `gorm:"not null;default:true"`
	Model
	Products []PointsProduct `gorm:"foreignKey:CategoryID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type PointsProduct struct {
	ID               string         `gorm:"primaryKey"`
	CategoryID       string         `gorm:"not null;index"`
	Category         PointsCategory `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Title            string         `gorm:"not null"`
	Description      string
	RedemptionMethod string `gorm:"not null"`
	Value            float64
	Image            string
	Emoji            string
	Points           int  `gorm:"not null"`
	Stock            int  `gorm:"not null;default:-1"`
	Active           bool `gorm:"not null;default:true"`
	SortOrder        int
	Model
}

type PointsRedemption struct {
	ID              string        `gorm:"primaryKey"`
	UserID          string        `gorm:"not null;index"`
	User            Profile       `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	ProductID       string        `gorm:"not null;index"`
	Product         PointsProduct `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	PointsCost      int           `gorm:"not null"`
	Status          string        `gorm:"not null"`
	AddressSnapshot string        `gorm:"type:jsonb"`
	AppPhone        string
	Model
}

type BenefitItem struct {
	ID        string `gorm:"primaryKey"`
	Emoji     string
	Label     string `gorm:"not null"`
	Action    string `gorm:"not null"`
	SortOrder int
	Active    bool `gorm:"not null;default:true"`
	Model
}

type BenefitNotice struct {
	ID        string `gorm:"primaryKey"`
	Content   string `gorm:"not null"`
	SortOrder int
	Active    bool `gorm:"not null;default:true"`
	Model
}

type BenefitPromo struct {
	ID            string `gorm:"primaryKey"`
	Image         string `gorm:"not null"`
	Action        string `gorm:"not null"`
	DialogTitle   string
	DialogImage   string
	PrimaryText   string
	SecondaryText string
	SortOrder     int
	Active        bool `gorm:"not null;default:true"`
	Model
}

type DailyTask struct {
	ID        string `gorm:"primaryKey"`
	Emoji     string
	Title     string `gorm:"not null"`
	Reward    int    `gorm:"not null"`
	Action    string `gorm:"not null"`
	SortOrder int
	Active    bool `gorm:"not null;default:true"`
	Model
}

type DailyTaskCompletion struct {
	ID          string    `gorm:"primaryKey"`
	UserID      string    `gorm:"not null;uniqueIndex:idx_task_completions_user_task_date"`
	User        Profile   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TaskID      string    `gorm:"not null;uniqueIndex:idx_task_completions_user_task_date"`
	Task        DailyTask `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CompletedOn time.Time `gorm:"type:date;not null;uniqueIndex:idx_task_completions_user_task_date"`
	Points      int       `gorm:"not null"`
	Model
}

type Game struct {
	ID          string `gorm:"primaryKey"`
	Emoji       string
	Image       string
	Title       string `gorm:"not null"`
	Rule        string
	Description string
	Link        string
	Points      int `gorm:"not null"`
	DailyLimit  int `gorm:"not null"`
	TeamSize    int `gorm:"not null;default:1"`
	Tone        string
	SortOrder   int
	Active      bool `gorm:"not null;default:true"`
	Model
}

type GamePlay struct {
	ID       string    `gorm:"primaryKey"`
	UserID   string    `gorm:"not null;index"`
	User     Profile   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	GameID   string    `gorm:"not null;index"`
	Game     Game      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	PlayedOn time.Time `gorm:"type:date;not null;index"`
	Points   int       `gorm:"not null"`
	Model
}
