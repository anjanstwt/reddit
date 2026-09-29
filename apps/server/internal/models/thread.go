package models

import (
	"encoding/json"
	"time"
)

// a thread means both post and comment, 
// means a post will have, parent as null, root as null, depth = 0, and a title
// and comment will have, parent, root, depth >= 1, and no title
type Thread struct {
	ID string `gorm:"type:uuid;primaryKey;default:gen_random_uuid();check:thread_shape,(parent_id IS NULL AND root_id IS NULL AND depth = 0 AND title IS NOT NULL) OR (parent_id IS NOT NULL AND root_id IS NOT NULL AND depth > 0 AND title IS NULL AND pinned = false AND locked = false)" json:"id"`

	// Comments copy the post's community so community queries never walk the tree.
	CommunityID string     `gorm:"type:uuid;not null;index:idx_threads_community_created,priority:1,where:parent_id IS NULL;index:idx_threads_community_score,priority:1,where:parent_id IS NULL" json:"communityId"`
	Community   *Community `gorm:"constraint:OnDelete:CASCADE" json:"community,omitempty"`

	AuthorID string `gorm:"type:uuid;not null;index:idx_threads_author_created,priority:1" json:"authorId"`
	Author   *User  `gorm:"constraint:OnDelete:RESTRICT" json:"author,omitempty"`

	ParentID *string `gorm:"type:uuid;index" json:"parentId"`
	Parent   *Thread `gorm:"foreignKey:ParentID;constraint:OnDelete:CASCADE" json:"-"`
	RootID   *string `gorm:"type:uuid;index:idx_threads_root_created,priority:1" json:"rootId"`
	Root     *Thread `gorm:"foreignKey:RootID;constraint:OnDelete:CASCADE" json:"-"`
	Depth    int     `gorm:"not null;default:0" json:"depth"`

	Title *string `gorm:"size:300" json:"title"`

	// this is the json created by tiptap
	Body json.RawMessage `gorm:"type:jsonb;not null" json:"body"`

	Pinned bool `gorm:"not null;default:false" json:"pinned"`
	Locked bool `gorm:"not null;default:false" json:"locked"`

	Score     int `gorm:"not null;default:0;index:idx_threads_community_score,priority:2;check:thread_score,score = upvotes - downvotes" json:"score"`
	Upvotes   int `gorm:"not null;default:0" json:"upvotes"`
	Downvotes int `gorm:"not null;default:0" json:"downvotes"`

	// Direct replies only.
	ReplyCount int `gorm:"not null;default:0" json:"replyCount"`

	// Every comment under a post, at any depth. Stays 0 on comments.
	CommentCount int `gorm:"not null;default:0" json:"commentCount"`

	EditedAt *time.Time `json:"editedAt"`
	
	// soft deleting the threads
	DeletedAt *time.Time `json:"deletedAt"`
	CreatedAt time.Time  `gorm:"index:idx_threads_community_created,priority:2;index:idx_threads_author_created,priority:2;index:idx_threads_root_created,priority:2" json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

type ThreadVote struct {
	UserID    string    `gorm:"type:uuid;primaryKey" json:"userId"`
	ThreadID  string    `gorm:"type:uuid;primaryKey;index" json:"threadId"`
	Value     int16     `gorm:"not null;check:thread_vote_value,value IN (-1, 1)" json:"value"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	User   *User   `gorm:"constraint:OnDelete:CASCADE" json:"-"`
	Thread *Thread `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

type SavedThread struct {
	UserID    string    `gorm:"type:uuid;primaryKey;index:idx_saved_threads_user_created,priority:1" json:"userId"`
	ThreadID  string    `gorm:"type:uuid;primaryKey;index" json:"threadId"`
	CreatedAt time.Time `gorm:"index:idx_saved_threads_user_created,priority:2" json:"createdAt"`

	User   *User   `gorm:"constraint:OnDelete:CASCADE" json:"-"`
	Thread *Thread `gorm:"constraint:OnDelete:CASCADE" json:"thread,omitempty"`
}

// u/name inside a thread body. Rebuilt from the body on every create/edit.
type ThreadUserMention struct {
	ThreadID string `gorm:"type:uuid;primaryKey" json:"threadId"`
	UserID   string `gorm:"type:uuid;primaryKey;index" json:"userId"`

	Thread *Thread `gorm:"constraint:OnDelete:CASCADE" json:"-"`
	User   *User   `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

// r/name inside a thread body. Rebuilt from the body on every create/edit.
type ThreadCommunityMention struct {
	ThreadID    string `gorm:"type:uuid;primaryKey" json:"threadId"`
	CommunityID string `gorm:"type:uuid;primaryKey;index" json:"communityId"`

	Thread    *Thread    `gorm:"constraint:OnDelete:CASCADE" json:"-"`
	Community *Community `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}
