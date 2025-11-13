# 问答社区系统 API 接口文档

## 基本信息

- **API 版本**: 1.0.0
- **基础路径**: `/api`
- **认证方式**: SSO登录（通过 `gw_session` 请求头）
- **响应格式**: JSON

## 通用响应格式

所有接口统一返回以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 响应字段说明

- `code`: 响应码，200表示成功
- `message`: 响应消息
- `data`: 响应数据（可选）

---

## 1. 认证相关 (`/api/auth`)

### 1.1 每日签到

**接口地址**: `POST /api/auth/sign-in`

**接口描述**: 每日签到接口，每天只能签到一次，签到成功会获得积分奖励

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "signed": true,
    "points": 10,
    "message": "签到成功，获得10积分"
  }
}
```

---

## 2. 用户相关 (`/api/user`)

### 2.1 我的主页

**接口地址**: `GET /api/user/profile`

**接口描述**: 获取当前用户的主页信息

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "staff_code": "001",
    "name": "张三",
    "forum_avatar": "http://example.com/avatar.jpg",
    "nickname": "小张",
    "forum_tag": "普通用户",
    "self_introduction": "自我介绍",
    "birthday": "1990-01-01",
    "job_title": "经理",
    "question_count": 10,
    "answer_count": 20,
    "total_points": 500
  }
}
```

### 2.2 查看他人主页

**接口地址**: `GET /api/user/profile/{staff_code}`

**接口描述**: 查看指定用户的主页信息

**路径参数**:
- `staff_code`: 员工工号

**请求头**:
- `gw_session`: SSO会话标识（可选，用于判断是否关注）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "staff_code": "002",
    "name": "李四",
    "forum_avatar": "http://example.com/avatar2.jpg",
    "nickname": "小李",
    "forum_tag": "专家",
    "self_introduction": "自我介绍",
    "birthday": "1991-01-01",
    "job_title": "主管",
    "question_count": 5,
    "answer_count": 15,
    "total_points": 300,
    "is_followed": true
  }
}
```

### 2.3 我的积分

**接口地址**: `GET /api/user/points`

**接口描述**: 获取当前用户的积分明细

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认50）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_points": 500,
    "records": [
      {
        "record_id": 1,
        "points": 30,
        "type": "question",
        "description": "发布问题奖励30积分",
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 2.4 关注/取消关注用户

**接口地址**: `POST /api/user/follow/{target_code}`

**接口描述**: 关注或取消关注指定用户（切换方式）

**路径参数**:
- `target_code`: 目标用户工号

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "关注成功",
  "data": {
    "followed": true
  }
}
```

### 2.5 我关注的用户列表

**接口地址**: `GET /api/user/followed-users`

**接口描述**: 获取当前用户关注的用户列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "staff_code": "002",
        "name": "李四",
        "nickname": "小李",
        "forum_avatar": "http://example.com/avatar2.jpg",
        "forum_tag": "专家",
        "follow_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 2.6 用户列表

**接口地址**: `GET /api/user/list`

**接口描述**: 获取用户列表（按被关注数量排序）

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）
- `keyword`: 关键词搜索（工号或姓名，可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "staff_code": "001",
        "name": "张三",
        "nickname": "小张",
        "forum_avatar": "http://example.com/avatar.jpg",
        "forum_tag": "普通用户",
        "job_title": "经理",
        "follow_count": 10,
        "answer_count": 20,
        "question_count": 5,
        "total_points": 500,
        "is_followed": false
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

### 2.7 更新用户资料

**接口地址**: `PUT /api/user/profile-update`

**接口描述**: 编辑用户资料（可修改昵称、生日、性别、自我介绍、头像）

**请求体**:
```json
{
  "nickname": "新昵称",
  "birthday": "1990-01-01",
  "forum_gender": 2,
  "self_introduction": "新的自我介绍",
  "forum_avatar": "http://example.com/new_avatar.jpg"
}
```

**字段说明**:
- `nickname`: 昵称（可选）
- `birthday`: 生日，格式：YYYY-MM-DD（可选）
- `forum_gender`: 论坛上的性别，0未知；1女；2男；3未说明（可选）
- `self_introduction`: 自我介绍（可选）
- `forum_avatar`: 论坛个人头像URL（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "staff_code": "001",
    "nickname": "新昵称",
    "birthday": "1990-01-01",
    "forum_gender": 2,
    "self_introduction": "新的自我介绍",
    "forum_avatar": "http://example.com/new_avatar.jpg"
  }
}
```

---

## 3. 问题相关 (`/api/questions`)

### 3.1 发布提问

**接口地址**: `POST /api/questions/create`

**接口描述**: 发布新问题

**请求体**:
```json
{
  "title": "问题标题",
  "content": "问题内容",
  "images": ["http://example.com/image1.jpg"],
  "category": "求助类",
  "is_anonymous": 0,
  "related_dept_ids": [1, 2],
  "related_staff_codes": ["001", "002"],
  "topic_ids": [1, 2]
}
```

**字段说明**:
- `title`: 问题标题（必需）
- `content`: 问题内容（必需）
- `images`: 图片URL列表（可选）
- `category`: 问题分类，可选值：`求助类`、`建议类`、`吐槽类`（必需）
- `is_anonymous`: 是否匿名，0否，1是（默认0）
- `related_dept_ids`: 关联部门ID列表（可选）
- `related_staff_codes`: 关联员工工号列表（可选）
- `topic_ids`: 话题ID列表（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "question_id": 1
  }
}
```

### 3.2 修改提问

**接口地址**: `PUT /api/questions/update/{question_id}`

**接口描述**: 修改已发布的问题（只能修改自己发布的问题）

**路径参数**:
- `question_id`: 问题ID

**请求体**: 同发布提问，所有字段可选

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "question_id": 1
  }
}
```

### 3.3 获取问题详情

**接口地址**: `GET /api/questions/detail/{question_id}`

**接口描述**: 获取问题的详细信息

**路径参数**:
- `question_id`: 问题ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "question_id": 1,
    "title": "问题标题",
    "content": "问题内容",
    "images": ["http://example.com/image1.jpg"],
    "category": "求助类",
    "is_anonymous": 0,
    "asker_code": "001",
    "asker_name": "张三",
    "asker_avatar": "http://example.com/avatar.jpg",
    "status": 0,
    "status_change_time": "2024-01-01T10:00:00",
    "is_featured": 0,
    "is_offline": 0,
    "view_count": 100,
    "like_count": 10,
    "favorite_count": 5,
    "answer_count": 3,
    "is_president": 0,
    "deadline": "2024-01-04T10:00:00",
    "create_time": "2024-01-01T10:00:00",
    "update_time": "2024-01-01T10:00:00",
    "topics": [
      {
        "topic_id": 1,
        "title": "话题标题"
      }
    ],
    "related_dept_ids": [1, 2],
    "related_staff_codes": ["001", "002"]
  }
}
```

### 3.4 获取问题列表

**接口地址**: `GET /api/questions/list`

**接口描述**: 获取问题列表，支持多种筛选和排序方式

**查询参数**:
- `category`: 问题分类，可选值：`求助类`、`建议类`、`吐槽类`（可选）
- `status`: 问题状态，0待解决，1已解决，2未解决，3已关闭（可选）
- `keyword`: 关键词搜索（可选）
- `interest_type`: 兴趣类型，可选值：`推荐`、`关注`（可选）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（可选，使用推荐或关注功能时需要）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "question_id": 1,
        "title": "问题标题",
        "content": "问题内容（前200字）",
        "images": ["http://example.com/image1.jpg"],
        "category": "求助类",
        "is_anonymous": 0,
        "asker_name": "张三",
        "asker_avatar": "http://example.com/avatar.jpg",
        "status": 0,
        "is_featured": 0,
        "view_count": 100,
        "like_count": 10,
        "favorite_count": 5,
        "answer_count": 3,
        "create_time": "2024-01-01T10:00:00",
        "interest_type": null
      }
    ]
  }
}
```

### 3.5 收藏/取消收藏问题

**接口地址**: `POST /api/questions/favorite/{question_id}`

**接口描述**: 收藏或取消收藏问题（切换方式）

**路径参数**:
- `question_id`: 问题ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "favorited": true
  }
}
```

### 3.6 更新问题状态

**接口地址**: `PUT /api/questions/update-status/{question_id}`

**接口描述**: 更新问题状态（已解决、未解决、关闭），只能由提问人操作

**路径参数**:
- `question_id`: 问题ID

**查询参数**:
- `status`: 状态值，1已解决，2未解决，3已关闭

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 3.7 点赞/取消点赞问题

**接口地址**: `POST /api/questions/like/{question_id}`

**接口描述**: 点赞或取消点赞问题（切换方式）

**路径参数**:
- `question_id`: 问题ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "liked": true
  }
}
```

### 3.8 我的提问

**接口地址**: `GET /api/questions/my-ask`

**接口描述**: 获取当前用户发布的问题列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "question_id": 1,
        "title": "问题标题",
        "content": "问题内容（前200字）",
        "images": ["http://example.com/image1.jpg"],
        "category": "求助类",
        "status": 0,
        "asker_avatar": "http://example.com/avatar.jpg",
        "view_count": 100,
        "like_count": 10,
        "favorite_count": 5,
        "answer_count": 3,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 3.9 查看某个人的问题列表

**接口地址**: `GET /api/questions/list/by-user/{target_user_code}`

**接口描述**: 查看指定用户发布的问题列表

**路径参数**:
- `target_user_code`: 目标用户工号

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"我的提问"

### 3.10 我收藏的问题和回答

**接口地址**: `GET /api/questions/my-favorites`

**接口描述**: 获取当前用户收藏的问题和回答列表（混合类型）

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "type": "question",
        "id": 1,
        "title": "问题标题",
        "content": "问题内容（前200字）",
        "images": ["http://example.com/image1.jpg"],
        "category": "求助类",
        "status": 0,
        "asker_avatar": "http://example.com/avatar.jpg",
        "view_count": 100,
        "like_count": 10,
        "favorite_count": 5,
        "answer_count": 3,
        "create_time": "2024-01-01T10:00:00",
        "favorite_time": "2024-01-01T11:00:00"
      },
      {
        "type": "answer",
        "id": 1,
        "question_id": 1,
        "question_title": "问题标题",
        "content": "回答内容（前200字）",
        "answerer_name": "李四",
        "is_official": 0,
        "points_awarded": 10,
        "is_useful": 1,
        "like_count": 5,
        "view_count": 50,
        "favorite_count": 2,
        "create_time": "2024-01-01T12:00:00",
        "favorite_time": "2024-01-01T13:00:00"
      }
    ]
  }
}
```

### 3.11 我收藏的问题

**接口地址**: `GET /api/questions/my-favorite`

**接口描述**: 获取当前用户收藏的问题列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"我的提问"

### 3.12 邀请我的问题

**接口地址**: `GET /api/questions/my-invited`

**接口描述**: 获取邀请当前用户的问题列表（包括直接关联用户和关联用户所在部门的问题）

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"我的提问"

---

## 4. 回答相关 (`/api/answers`)

### 4.1 回答问题或回复回答

**接口地址**: `POST /api/answers/create`

**接口描述**: 回答问题或回复某个回答

**请求体**:
```json
{
  "question_id": 1,
  "parent_answer_id": null,
  "content": "回答内容",
  "images": ["http://example.com/image1.jpg"]
}
```

**字段说明**:
- `question_id`: 问题ID（必需）
- `parent_answer_id`: 父回答ID，为空表示直接回答问题，有值表示回复某个回答（可选）
- `content`: 回答内容（必需）
- `images`: 图片URL列表（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer_id": 1
  }
}
```

### 4.2 修改回答

**接口地址**: `PUT /api/answers/update/{answer_id}`

**接口描述**: 修改已发布的回答（只能修改自己发布的回答）

**路径参数**:
- `answer_id`: 回答ID

**请求体**:
```json
{
  "content": "修改后的回答内容",
  "images": ["http://example.com/image1.jpg"]
}
```

**字段说明**:
- `content`: 回答内容（可选）
- `images`: 图片URL列表（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer_id": 1
  }
}
```

### 4.3 获取问题的回答列表

**接口地址**: `GET /api/answers/list/question/{question_id}`

**接口描述**: 获取指定问题的回答列表（包含嵌套回复）

**路径参数**:
- `question_id`: 问题ID

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认50）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "answer_id": 1,
        "question_id": 1,
        "parent_answer_id": null,
        "content": "回答内容",
        "images": ["http://example.com/image1.jpg"],
        "answerer_code": "002",
        "answerer_name": "李四",
        "answerer_avatar": "http://example.com/avatar2.jpg",
        "is_official": 1,
        "is_pinned": 1,
        "points_awarded": 10,
        "is_useful": 1,
        "like_count": 5,
        "view_count": 50,
        "favorite_count": 2,
        "create_time": "2024-01-01T12:00:00",
        "replies": [
          {
            "answer_id": 2,
            "question_id": 1,
            "parent_answer_id": 1,
            "content": "回复内容",
            "images": [],
            "answerer_code": "003",
            "answerer_name": "王五",
            "answerer_avatar": "http://example.com/avatar3.jpg",
            "is_official": 0,
            "is_pinned": 0,
            "points_awarded": 0,
            "is_useful": 0,
            "like_count": 2,
            "view_count": 20,
            "favorite_count": 0,
            "create_time": "2024-01-01T13:00:00"
          }
        ]
      }
    ]
  }
}
```

### 4.4 获取回答详情

**接口地址**: `GET /api/answers/detail/{answer_id}`

**接口描述**: 获取回答的详细信息（包含回复列表）

**路径参数**:
- `answer_id`: 回答ID

**响应示例**: 同"获取问题的回答列表"中的单个回答对象

### 4.5 我的被采纳回答

**接口地址**: `GET /api/answers/my-useful`

**接口描述**: 获取当前用户被标记为有用的回答列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "answer_id": 1,
        "question_id": 1,
        "question_title": "问题标题",
        "content": "回答内容（前200字）",
        "answerer_code": "002",
        "answerer_name": "李四",
        "answerer_avatar": "http://example.com/avatar2.jpg",
        "points_awarded": 10,
        "is_useful": 1,
        "like_count": 5,
        "view_count": 50,
        "favorite_count": 2,
        "create_time": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

### 4.6 标记回答为有用

**接口地址**: `POST /api/answers/useful/{answer_id}`

**接口描述**: 标记回答为有用（只有提问人可以操作）

**路径参数**:
- `answer_id`: 回答ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

### 4.7 删除回答

**接口地址**: `DELETE /api/answers/delete/{answer_id}`

**接口描述**: 删除回答（只能删除自己发布的回答）

**路径参数**:
- `answer_id`: 回答ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 4.8 点赞/取消点赞回答

**接口地址**: `POST /api/answers/like/{answer_id}`

**接口描述**: 点赞或取消点赞回答（切换方式）

**路径参数**:
- `answer_id`: 回答ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "liked": true
  }
}
```

### 4.9 收藏/取消收藏回答

**接口地址**: `POST /api/answers/favorite/{answer_id}`

**接口描述**: 收藏或取消收藏回答（切换方式）

**路径参数**:
- `answer_id`: 回答ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "favorited": true
  }
}
```

### 4.10 我的回答

**接口地址**: `GET /api/answers/my`

**接口描述**: 获取当前用户发布的回答列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"我的被采纳回答"

### 4.11 查看某个人的回答列表

**接口地址**: `GET /api/answers/list/by-user/{target_user_code}`

**接口描述**: 查看指定用户发布的回答列表

**路径参数**:
- `target_user_code`: 目标用户工号

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"我的被采纳回答"

---

## 5. 话题相关 (`/api/topics`)

### 5.1 收藏/取消收藏话题

**接口地址**: `POST /api/topics/favorite/{topic_id}`

**接口描述**: 收藏或取消收藏话题（切换方式）

**路径参数**:
- `topic_id`: 话题ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "favorited": true
  }
}
```

### 5.2 我收藏的话题列表

**接口地址**: `GET /api/topics/my-favorite`

**接口描述**: 获取当前用户收藏的话题列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "topic_id": 1,
        "title": "话题标题",
        "description": "话题描述",
        "cover_image": "http://example.com/cover.jpg",
        "question_count": 10,
        "favorite_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 5.3 获取话题列表

**接口地址**: `GET /api/topics/list`

**接口描述**: 获取所有话题列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "topic_id": 1,
        "title": "话题标题",
        "description": "话题描述",
        "cover_image": "http://example.com/cover.jpg",
        "question_count": 10,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 5.4 搜索话题

**接口地址**: `GET /api/topics/search`

**接口描述**: 搜索话题（支持按标题和描述搜索）

**查询参数**:
- `keyword`: 关键词（必需）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**响应示例**: 同"获取话题列表"

### 5.5 获取话题详情

**接口地址**: `GET /api/topics/detail/{topic_id}`

**接口描述**: 获取话题的详细信息

**路径参数**:
- `topic_id`: 话题ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "topic_id": 1,
    "title": "话题标题",
    "description": "话题描述",
    "cover_image": "http://example.com/cover.jpg",
    "question_count": 10,
    "create_time": "2024-01-01T10:00:00"
  }
}
```

### 5.6 获取话题下的问题列表

**接口地址**: `GET /api/topics/questions/list/{topic_id}`

**接口描述**: 获取指定话题下的问题列表

**路径参数**:
- `topic_id`: 话题ID

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "question_id": 1,
        "title": "问题标题",
        "content": "问题内容（前200字）",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_name": "张三",
        "status": 0,
        "view_count": 100,
        "like_count": 10,
        "answer_count": 3,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

## 6. 部门相关 (`/api/department`)

### 6.1 查询部门组织和人员

**接口地址**: `GET /api/department/tree`

**接口描述**: 查询部门组织和人员树形结构

**查询参数**:
- `dept_id`: 部门ID（可选，如果提供则只查询该部门及其人员）
- `include_children`: 是否包括子部门（默认true）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "departments": [
      {
        "dept_id": 1,
        "dept_code": "D001",
        "dept_name": "技术部",
        "full_name": "公司/技术部",
        "parent_id": 0,
        "is_anonymous_allowed": true,
        "staffs": [
          {
            "staff_id": 1,
            "staff_code": "001",
            "name": "张三",
            "job_title": "经理",
            "is_virtual": false,
            "is_anonymous_allowed": true
          }
        ],
        "children": []
      }
    ],
    "total_departments": 10,
    "total_staffs": 100
  }
}
```

---

## 7. 消息相关 (`/api/messages`)

### 7.1 消息汇总

**接口地址**: `GET /api/messages/summary`

**接口描述**: 获取消息汇总（未读数量）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "personal_unread_count": 5,
    "department_unread_count": 3,
    "system_unread_count": 2,
    "total_unread_count": 10
  }
}
```

### 7.2 个人消息列表

**接口地址**: `GET /api/messages/personal`

**接口描述**: 获取个人消息列表

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）
- `is_read`: 是否已读，0未读，1已读（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "unread_count": 5,
    "items": [
      {
        "message_id": 1,
        "message_type": "personal",
        "title": "消息标题",
        "content": "消息内容",
        "target_type": "question",
        "target_id": 1,
        "target_code": "001",
        "dept_id": null,
        "is_read": 0,
        "read_time": null,
        "create_time": "2024-01-01T10:00:00",
        "sender_name": "张三",
        "sender_avatar": "http://example.com/avatar.jpg"
      }
    ]
  }
}
```

### 7.3 部门消息列表

**接口地址**: `GET /api/messages/department`

**接口描述**: 获取部门消息列表（用户所属部门的消息）

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）
- `is_read`: 是否已读，0未读，1已读（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"个人消息列表"

### 7.4 系统消息列表

**接口地址**: `GET /api/messages/system`

**接口描述**: 获取系统消息列表（全员消息）

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "unread_count": 2,
    "items": [
      {
        "message_id": 1,
        "title": "系统消息标题",
        "content": "系统消息内容",
        "target_type": "admin",
        "target_id": null,
        "is_read": false,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

### 7.5 标记系统消息为已读

**接口地址**: `POST /api/messages/system/read`

**接口描述**: 标记系统消息为已读（更新最后查看时间）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

### 7.6 标记消息为已读

**接口地址**: `POST /api/messages/read/{message_id}`

**接口描述**: 标记个人消息或部门消息为已读

**路径参数**:
- `message_id`: 消息ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

### 7.7 标记所有消息为已读

**接口地址**: `POST /api/messages/read-all`

**接口描述**: 标记所有消息为已读

**查询参数**:
- `message_type`: 消息类型，可选值：`personal`、`department`、`system`（可选，不传则标记所有类型）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "已标记10条消息为已读",
  "data": {
    "count": 10
  }
}
```

### 7.8 删除消息

**接口地址**: `DELETE /api/messages/{message_id}`

**接口描述**: 删除个人消息或部门消息

**路径参数**:
- `message_id`: 消息ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 8. 管理端 (`/api/admin`)

### 8.1 内容管理

#### 8.1.1 问题列表

**接口地址**: `GET /api/admin/questions/list`

**接口描述**: 内容管理-问题列表（包括匿名用户真实身份）

**权限要求**: 管理员（部门管理员或超级管理员）

**查询参数**:
- `category`: 问题分类，可选值：`求助类`、`建议类`、`吐槽类`（可选）
- `status`: 问题状态，可选值：`待解决`、`已解决`、`未解决`、`已关闭`（可选）
- `dept_id`: 部门ID（可选）
- `keyword`: 关键词搜索（可选）
- `start_time`: 开始时间（可选）
- `end_time`: 结束时间（可选）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "question_id": 1,
        "title": "问题标题",
        "content": "问题内容",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_code": "001",
        "asker_name": "张三",
        "related_depts": [
          {
            "dept_id": 1,
            "dept_name": "技术部"
          }
        ],
        "related_staffs": [
          {
            "staff_id": 1,
            "staff_code": "001",
            "staff_name": "张三"
          }
        ],
        "status": 0,
        "is_featured": 0,
        "is_offline": 0,
        "view_count": 100,
        "like_count": 10,
        "answer_count": 3,
        "create_time": "2024-01-01T10:00:00",
        "deadline": "2024-01-04T10:00:00",
        "days_remaining": 3,
        "topics": [
          {
            "topic_id": 1,
            "title": "话题标题"
          }
        ]
      }
    ]
  }
}
```

#### 8.1.2 标记精选

**接口地址**: `PUT /api/admin/questions/mark-featured/{question_id}`

**接口描述**: 标记问题为精选或取消精选

**权限要求**: 管理员

**路径参数**:
- `question_id`: 问题ID

**查询参数**:
- `is_featured`: 是否精选，0否，1是

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功"
}
```

#### 8.1.3 删除问题

**接口地址**: `DELETE /api/admin/questions/delete/{question_id}`

**接口描述**: 删除问题

**权限要求**: 管理员

**路径参数**:
- `question_id`: 问题ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

#### 8.1.4 问题下线/上线

**接口地址**: `PUT /api/admin/questions/offline/{question_id}`

**接口描述**: 问题下线或上线

**权限要求**: 管理员

**路径参数**:
- `question_id`: 问题ID

**查询参数**:
- `is_offline`: 是否下线，0上线，1下线

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功"
}
```

#### 8.1.5 人力转办

**接口地址**: `POST /api/admin/questions/transfer/{question_id}`

**接口描述**: 人力转办问题到多个部门（仅超级管理员）

**权限要求**: 超级管理员

**路径参数**:
- `question_id`: 问题ID

**请求体**:
```json
{
  "dept_ids": [1, 2],
  "topic_ids": [1, 2]
}
```

**字段说明**:
- `dept_ids`: 转办部门ID列表（必需）
- `topic_ids`: 话题ID列表（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "转办成功"
}
```

#### 8.1.6 删除回答

**接口地址**: `DELETE /api/admin/answers/delete/{answer_id}`

**接口描述**: 删除回答

**权限要求**: 管理员

**路径参数**:
- `answer_id`: 回答ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 8.2 话题管理

#### 8.2.1 创建话题

**接口地址**: `POST /api/admin/topics/create`

**接口描述**: 创建新话题

**权限要求**: 管理员

**请求体**:
```json
{
  "title": "话题标题",
  "description": "话题描述",
  "cover_image": "http://example.com/cover.jpg"
}
```

**字段说明**:
- `title`: 话题标题（必需）
- `description`: 话题描述（可选）
- `cover_image`: 封面图片URL（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "topic_id": 1
  }
}
```

#### 8.2.2 更新话题

**接口地址**: `PUT /api/admin/topics/update/{topic_id}`

**接口描述**: 更新话题信息

**权限要求**: 管理员

**路径参数**:
- `topic_id`: 话题ID

**请求体**: 同创建话题，所有字段可选

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 8.3 奖励规则管理

#### 8.3.1 创建奖励规则

**接口地址**: `POST /api/admin/reward-rules/create`

**接口描述**: 创建新的奖励规则

**权限要求**: 管理员

**请求体**:
```json
{
  "rule_name": "发布问题",
  "rule_code": "question",
  "points": 30,
  "rule_description": "发布问题奖励30积分",
  "conditions": {
    "min_length": 10
  }
}
```

**字段说明**:
- `rule_name`: 规则名称（必需）
- `rule_code`: 规则代码，可选值：`question`、`answer`、`useful_answer`、`sign_in`、`inappropriate_comment`等（必需）
- `points`: 积分值，正数表示加分，负数表示减分（必需）
- `rule_description`: 规则描述（可选）
- `conditions`: 条件配置（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "rule_id": 1
  }
}
```

#### 8.3.2 获取奖励规则列表

**接口地址**: `GET /api/admin/reward-rules/list`

**接口描述**: 获取奖励规则列表

**权限要求**: 管理员

**查询参数**:
- `status`: 状态，0禁用，1启用（可选）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认50）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "rule_id": 1,
        "rule_name": "发布问题",
        "rule_code": "question",
        "points": 30,
        "rule_description": "发布问题奖励30积分",
        "conditions": {
          "min_length": 10
        },
        "status": 1,
        "create_time": "2024-01-01T10:00:00",
        "update_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

#### 8.3.3 更新奖励规则

**接口地址**: `PUT /api/admin/reward-rules/update/{rule_id}`

**接口描述**: 更新奖励规则（只允许修改积分值和积分描述）

**权限要求**: 管理员

**路径参数**:
- `rule_id`: 规则ID

**请求体**:
```json
{
  "points": 50,
  "rule_description": "发布问题奖励50积分"
}
```

**字段说明**:
- `points`: 积分值（可选）
- `rule_description`: 规则描述（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

#### 8.3.4 删除奖励规则

**接口地址**: `DELETE /api/admin/reward-rules/delete/{rule_id}`

**接口描述**: 删除奖励规则

**权限要求**: 管理员

**路径参数**:
- `rule_id`: 规则ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 8.4 用户管理

#### 8.4.1 用户列表

**接口地址**: `GET /api/admin/staffs/list`

**接口描述**: 获取用户列表

**权限要求**: 管理员

**查询参数**:
- `dept_id`: 部门ID（可选）
- `forum_tag`: 用户标签（可选）
- `keyword`: 关键词搜索（工号或姓名，可选）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认20）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "staff_id": 1,
        "staff_code": "001",
        "name": "张三",
        "forum_gender": 2,
        "type": 1,
        "phone": "13800138000",
        "status": 1,
        "job_status": 1,
        "forum_avatar": "http://example.com/avatar.jpg",
        "nickname": "小张",
        "self_introduction": "自我介绍",
        "birthday": "1990-01-01",
        "job_title": "经理",
        "forum_tag": "普通用户",
        "is_forbidden": 0,
        "role": 0,
        "total_points": 500,
        "departments": [
          {
            "dept_id": 1,
            "dept_code": "D001",
            "dept_name": "技术部",
            "full_name": "公司/技术部"
          }
        ],
        "create_time": "2024-01-01T10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

#### 8.4.2 禁用/取消禁用员工

**接口地址**: `PUT /api/admin/staffs/forbidden/{staff_code}`

**接口描述**: 禁用或取消禁用员工（只有超级管理员可以操作）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**查询参数**:
- `is_forbidden`: 是否禁用，0取消禁用，1禁用

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "禁用成功"
}
```

#### 8.4.3 修改用户标签

**接口地址**: `PUT /api/admin/staffs/forum-tag/{staff_code}`

**接口描述**: 修改用户标签（只有超级管理员可以操作）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**查询参数**:
- `forum_tag`: 新的标签值，如 `普通用户`、`专家` 等

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "staff_code": "001",
    "forum_tag": "专家"
  }
}
```

#### 8.4.4 查看员工积分

**接口地址**: `GET /api/admin/staffs/points/{staff_code}`

**接口描述**: 查看员工积分（只有超级管理员可以操作）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认50）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "staff_code": "001",
    "staff_name": "张三",
    "total_points": 500,
    "items": [
      {
        "record_id": 1,
        "points": 30,
        "type": "question",
        "related_id": 1,
        "related_type": "question",
        "description": "发布问题奖励30积分",
        "create_time": "2024-01-01T10:00:00"
      }
    ],
    "page": 1,
    "page_size": 50
  }
}
```

#### 8.4.5 调整员工积分

**接口地址**: `PUT /api/admin/staffs/points/{staff_code}`

**接口描述**: 调整员工积分（只有超级管理员可以操作）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**请求体**:
```json
{
  "current_points": 500,
  "new_points": 600
}
```

**字段说明**:
- `current_points`: 当前积分（必需）
- `new_points`: 调整后的积分（必需）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "调整成功",
  "data": {
    "staff_code": "001",
    "current_points": 500,
    "new_points": 600,
    "points_diff": 100
  }
}
```

### 8.5 操作日志

#### 8.5.1 操作日志列表

**接口地址**: `GET /api/admin/logs/list`

**接口描述**: 获取操作日志列表

**权限要求**: 管理员

**查询参数**:
- `user_code`: 用户工号（可选）
- `operation_type`: 操作类型（可选）
- `start_time`: 开始时间（可选）
- `end_time`: 结束时间（可选）
- `page`: 页码（默认1）
- `page_size`: 每页大小（默认100）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "log_id": 1,
        "user_code": "001",
        "user_name": "张三",
        "operation_type": "question_create",
        "target_type": "question",
        "target_id": 1,
        "content": "发布问题",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0",
        "create_time": "2024-01-01T10:00:00"
      }
    ],
    "total": 1000,
    "page": 1,
    "page_size": 100
  }
}
```

#### 8.5.2 查看操作记录详情

**接口地址**: `GET /api/admin/logs/{log_id}`

**接口描述**: 查看操作记录详情

**权限要求**: 管理员

**路径参数**:
- `log_id`: 日志ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**: 同"操作日志列表"中的单个日志对象

### 8.6 部门管理员管理

#### 8.6.1 添加部门管理员

**接口地址**: `POST /api/admin/dept-admins`

**接口描述**: 添加部门管理员（只有超级管理员可以操作）

**权限要求**: 超级管理员

**查询参数**:
- `staff_code`: 员工工号
- `dept_id`: 部门ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "staff_code": "001",
    "dept_id": 1
  }
}
```

#### 8.6.2 获取部门管理员列表

**接口地址**: `GET /api/admin/dept-admins`

**接口描述**: 获取部门管理员列表（只有超级管理员可以查看）

**权限要求**: 超级管理员

**查询参数**:
- `dept_id`: 部门ID（可选）
- `staff_code`: 员工工号（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "staff_code": "001",
        "staff_name": "张三",
        "dept_id": 1,
        "dept_name": "技术部",
        "status": 1,
        "create_time": "2024-01-01T10:00:00",
        "update_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

#### 8.6.3 删除部门管理员

**接口地址**: `DELETE /api/admin/dept-admins`

**接口描述**: 删除部门管理员（只有超级管理员可以操作）

**权限要求**: 超级管理员

**查询参数**:
- `staff_code`: 员工工号
- `dept_id`: 部门ID

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

#### 8.6.4 取消/恢复部门管理员权限

**接口地址**: `PUT /api/admin/dept-admins/status/{staff_code}`

**接口描述**: 取消或恢复部门管理员权限（只有超级管理员可以操作）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**查询参数**:
- `dept_id`: 部门ID
- `status`: 状态，0取消权限，1恢复权限

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "取消权限成功"
}
```

### 8.7 超级管理员管理

#### 8.7.1 添加超级管理员

**接口地址**: `POST /api/admin/super-admins`

**接口描述**: 添加超级管理员（只有超级管理员可以操作）

**权限要求**: 超级管理员

**查询参数**:
- `staff_code`: 员工工号

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "staff_code": "001"
  }
}
```

#### 8.7.2 获取超级管理员列表

**接口地址**: `GET /api/admin/super-admins`

**接口描述**: 获取超级管理员列表（只有超级管理员可以查看）

**权限要求**: 超级管理员

**查询参数**:
- `status`: 状态，0禁用，1启用（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "staff_code": "001",
        "staff_name": "张三",
        "status": 1,
        "create_time": "2024-01-01T10:00:00",
        "update_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

#### 8.7.3 删除超级管理员

**接口地址**: `DELETE /api/admin/super-admins/{staff_code}`

**接口描述**: 删除超级管理员（只有超级管理员可以操作，不能删除自己）

**权限要求**: 超级管理员

**路径参数**:
- `staff_code`: 员工工号

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 8.8 Dashboard

#### 8.8.1 Dashboard统计

**接口地址**: `GET /api/admin/dashboard`

**接口描述**: Dashboard统计（支持时间段筛选）

**权限要求**: 管理员

**查询参数**:
- `start_time`: 开始时间（可选）
- `end_time`: 结束时间（可选）

**请求头**:
- `gw_session`: SSO会话标识（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user_active_count": 100,
    "question_count": 500,
    "answer_count": 1000,
    "resolution_rate": 80.5,
    "department_stats": [
      {
        "dept_id": 1,
        "dept_name": "技术部",
        "total_count": 50,
        "reply_count": 40,
        "reply_rate": 80.0,
        "resolved_count": 30,
        "resolution_rate": 60.0,
        "timeout_count": 5,
        "avg_reply_time": 2.5
      }
    ],
    "topic_ranking": [
      {
        "topic_id": 1,
        "title": "话题标题",
        "popularity": 100
      }
    ]
  }
}
```

---

## 9. 文件上传 (`/api/upload`)

### 9.1 上传单个文件

**接口地址**: `POST /api/upload/file`

**接口描述**: 上传单个文件到MinIO

**支持的文件类型**:
- 图片：jpg, jpeg, png, gif, webp, bmp
- 文档：pdf, doc, docx, xls, xlsx, ppt, pptx
- 文本：txt, md

**文件大小限制**: 最大10MB

**请求头**:
- `gw_session`: SSO会话标识（必需）
- `Content-Type`: multipart/form-data

**请求体**: FormData
- `file`: 文件（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "文件上传成功",
  "data": {
    "file_url": "http://example.com/files/xxx.jpg",
    "file_name": "test.jpg",
    "file_size": 102400
  }
}
```

### 9.2 上传多个文件

**接口地址**: `POST /api/upload/files`

**接口描述**: 上传多个文件到MinIO

**限制**: 最多上传10个文件

**请求头**:
- `gw_session`: SSO会话标识（必需）
- `Content-Type`: multipart/form-data

**请求体**: FormData
- `files`: 文件列表（必需，多个文件）

**响应示例**:
```json
{
  "code": 200,
  "message": "成功上传 2 个文件",
  "data": {
    "files": [
      {
        "file_url": "http://example.com/files/xxx1.jpg",
        "file_name": "test1.jpg",
        "file_size": 102400
      },
      {
        "file_url": "http://example.com/files/xxx2.jpg",
        "file_name": "test2.jpg",
        "file_size": 204800
      }
    ],
    "success_count": 2,
    "error_count": 0,
    "errors": null
  }
}
```

### 9.3 上传单个图片

**接口地址**: `POST /api/upload/image`

**接口描述**: 上传单个图片文件（专门用于问题/回答中的图片）

**支持的文件类型**: jpg, jpeg, png, gif, webp, bmp

**文件大小限制**: 最大5MB

**请求头**:
- `gw_session`: SSO会话标识（必需）
- `Content-Type`: multipart/form-data

**请求体**: FormData
- `file`: 图片文件（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "图片上传成功",
  "data": {
    "image_url": "http://example.com/images/xxx.jpg",
    "file_name": "test.jpg",
    "file_size": 102400
  }
}
```

### 9.4 上传多个图片

**接口地址**: `POST /api/upload/images`

**接口描述**: 上传多个图片文件（专门用于问题/回答中的图片）

**限制**: 最多上传9张图片

**请求头**:
- `gw_session`: SSO会话标识（必需）
- `Content-Type`: multipart/form-data

**请求体**: FormData
- `files`: 图片文件列表（必需，多个文件）

**响应示例**:
```json
{
  "code": 200,
  "message": "成功上传 2 张图片",
  "data": {
    "image_urls": [
      "http://example.com/images/xxx1.jpg",
      "http://example.com/images/xxx2.jpg"
    ],
    "success_count": 2,
    "error_count": 0,
    "errors": null
  }
}
```

---

## 10. 根路径和健康检查

### 10.1 根路径

**接口地址**: `GET /`

**接口描述**: 根路径，返回API基本信息

**响应示例**:
```json
{
  "message": "问答社区系统API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

### 10.2 健康检查

**接口地址**: `GET /health`

**接口描述**: 健康检查接口

**响应示例**:
```json
{
  "status": "ok"
}
```

---

## 错误码说明

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 注意事项

1. **认证方式**: 所有需要登录的接口都需要在请求头中携带 `gw_session` 参数
2. **时间格式**: 所有时间字段使用 ISO 8601 格式，例如：`2024-01-01T10:00:00`
3. **分页**: 所有列表接口都支持分页，默认页码为1，每页大小为20
4. **匿名问题**: 匿名问题的提问人信息会被隐藏，显示为"momo"
5. **权限说明**:
   - 普通用户：可以查看和发布问题、回答等
   - 部门管理员：可以管理本部门及下属部门的内容
   - 超级管理员：可以管理所有内容
6. **文件上传**: 上传的文件会存储在MinIO中，返回的URL可以直接使用
7. **积分系统**: 系统会根据用户的操作自动奖励或扣除积分，具体规则由管理员配置

---

## 更新日志

- **v1.0.0** (2024-01-01): 初始版本发布

