# 问答社区系统 API 接口文档

## 基础信息

- **基础URL**: `http://10.129.114.106:8000`
- **API版本**: v1.0.0
- **认证方式**: SSO认证（通过 `gw_session` 请求头）



## 通用说明

### 请求头
所有需要认证的接口都需要在请求头中携带 `gw_session`：
暂时使用模拟数据 gw_session: 'appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员, gender=2, status=1,jobNo=staff001'


```bash
-H "gw_session: <your_session_token>"
```

### 响应格式
所有接口统一返回格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 1. 认证相关接口（这个接口暂时无用，登陆走统一Nginx网关）

### 1.1 SSO登录
**接口**: `POST /api/auth/sso-login`

**说明**: 从gw_session请求头中解析用户信息，同步到数据库

**请求头**:
```
gw_session: <your_session_token>
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/auth/sso-login" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "staff_code": "001",
    "name": "张三",
    "job_title": "经理",
    "department": "技术部",
    "org_id": "1",
    "dept_info": {
      "dept_id": 1,
      "dept_name": "技术部",
      "full_name": "技术部"
    }
  }
}
```

---

### 1.2 每日签到
**接口**: `POST /api/auth/sign-in`

**说明**: 每天只能签到一次，签到成功会获得积分奖励

**请求头**:
```
gw_session: <your_session_token>
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/auth/sign-in" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

## 2. 用户相关接口

### 2.1 我的主页
**接口**: `GET /api/user/profile`

**说明**: 获取当前用户的主页信息，包括提问数、回答数、总积分等

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/user/profile" \
  -H "gw_session: your_session_token_here"
```

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
    "question_count": 5,
    "answer_count": 10,
    "total_points": 150
  }
}
```

---

### 2.2 我的积分
**接口**: `GET /api/user/points`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认50

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/user/points?page=1&page_size=50" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_points": 150,
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

---

### 2.3 关注/取消关注用户
**接口**: `POST /api/user/follow/{target_code}`

**说明**: 切换关注状态（如果已关注则取消关注，如果未关注则关注）

**路径参数**:
- `target_code` (string): 目标用户工号

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/user/follow/002" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 2.4 我关注的用户列表
**接口**: `GET /api/user/followed-users`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/user/followed-users?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "forum_tag": "普通用户",
        "follow_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 2.5 编辑用户资料
**接口**: `PUT /api/user/profile`

**说明**: 可修改昵称、生日、性别、自我介绍、头像

**请求体**:
```json
{
  "nickname": "新昵称",
  "birthday": "1990-01-01",
  "forum_gender": 2,
  "self_introduction": "这是我的自我介绍",
  "forum_avatar": "http://example.com/avatar.jpg"
}
```

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/user/profile" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "新昵称",
    "birthday": "1990-01-01",
    "forum_gender": 2,
    "self_introduction": "这是我的自我介绍"
  }'
```

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
    "self_introduction": "这是我的自我介绍",
    "forum_avatar": "http://example.com/avatar.jpg"
  }
}
```

---

## 3. 部门相关接口

### 3.1 查询部门组织和人员
**接口**: `GET /api/department/tree`

**参数**:
- `dept_id` (int, 可选): 部门ID，如果不提供则查询所有部门
- `include_children` (bool, 可选): 是否包括子部门，默认true

**curl示例**:
```bash
# 查询所有部门
curl -X GET "http://localhost:8000/api/department/tree" \
  -H "gw_session: your_session_token_here"

# 查询指定部门
curl -X GET "http://localhost:8000/api/department/tree?dept_id=1&include_children=true" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "departments": [
      {
        "dept_id": 1,
        "dept_name": "技术部",
        "full_name": "技术部",
        "staffs": [
          {
            "staff_code": "001",
            "name": "张三"
          }
        ],
        "children": []
      }
    ],
    "total_departments": 1,
    "total_staffs": 1
  }
}
```

---

## 4. 问题相关接口

### 4.1 发布提问
**接口**: `POST /api/questions/create`

**请求体**:
```json
{
  "title": "问题标题",
  "content": "问题内容",
  "images": ["http://example.com/image1.jpg"],
  "category": "求助类",
  "is_anonymous": 0,
  "related_dept_ids": [1, 2],
  "related_staff_codes": ["002"],
  "topic_ids": [1, 2]
}
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/questions/create" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "问题标题",
    "content": "问题内容",
    "images": ["http://example.com/image1.jpg"],
    "category": "求助类",
    "is_anonymous": 0,
    "related_dept_ids": [1, 2],
    "related_staff_codes": ["002"],
    "topic_ids": [1, 2]
  }'
```

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

---

### 4.2 修改提问
**接口**: `PUT /api/questions/update/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**请求体** (所有字段可选):
```json
{
  "title": "新标题",
  "content": "新内容",
  "images": ["http://example.com/image2.jpg"],
  "category": "建议类",
  "related_dept_ids": [1],
  "related_staff_codes": ["003"],
  "topic_ids": [1]
}
```

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/questions/update/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新标题",
    "content": "新内容"
  }'
```

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

---

### 4.3 获取问题详情
**接口**: `GET /api/questions/detail/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/detail/1" \
  -H "gw_session: your_session_token_here"
```

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
    "status": 0,
    "is_featured": 0,
    "view_count": 10,
    "like_count": 5,
    "favorite_count": 3,
    "answer_count": 2,
    "topics": [
      {
        "topic_id": 1,
        "title": "话题1"
      }
    ],
    "related_dept_ids": [1, 2],
    "related_staff_codes": ["002"],
    "create_time": "2024-01-01T10:00:00"
  }
}
```

---

### 4.4 获取问题列表
**接口**: `GET /api/questions/list`

**参数**:
- `category` (string, 可选): 问题分类
- `status` (int, 可选): 状态（0待解决，1已解决，2未解决，3已关闭）
- `keyword` (string, 可选): 关键词搜索
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/list?category=求助类&page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_name": "张三",
        "status": 0,
        "is_featured": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 4.5 收藏/取消收藏问题
**接口**: `POST /api/questions/favorite/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/questions/favorite/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 4.6 更新问题状态
**接口**: `PUT /api/questions/update-status/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**查询参数**:
- `status` (int): 状态值（1已解决，2未解决，3已关闭）

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/questions/update-status/1?status=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

### 4.7 点赞/取消点赞问题
**接口**: `POST /api/questions/like/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/questions/like/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 4.8 我的提问
**接口**: `GET /api/questions/my-ask`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/my-ask?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 4.9 查看某个人的问题列表
**接口**: `GET /api/questions/list/by-user/{target_user_code}`

**路径参数**:
- `target_user_code` (string): 目标用户工号

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/list/by-user/002?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_code": "002",
        "asker_name": "李四",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 4.10 我收藏的问题和回答
**接口**: `GET /api/questions/my-favorites`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/my-favorites?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00",
        "favorite_time": "2024-01-01T11:00:00"
      },
      {
        "type": "answer",
        "id": 1,
        "question_id": 1,
        "question_title": "问题标题",
        "content": "回答内容...",
        "answerer_name": "李四",
        "is_official": 0,
        "points_awarded": 10,
        "is_useful": 0,
        "like_count": 3,
        "view_count": 5,
        "favorite_count": 1,
        "create_time": "2024-01-01T12:00:00",
        "favorite_time": "2024-01-01T13:00:00"
      }
    ]
  }
}
```

---

### 4.11 我收藏的问题
**接口**: `GET /api/questions/my-favorite`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/my-favorite?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 4.12 邀请我的问题
**接口**: `GET /api/questions/my-invited`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/questions/my-invited?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_name": "张三",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "favorite_count": 3,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

## 5. 回答相关接口

### 5.1 回答问题或回复回答
**接口**: `POST /api/answers/create`

**请求体**:
```json
{
  "question_id": 1,
  "parent_answer_id": null,
  "content": "回答内容",
  "images": ["http://example.com/image1.jpg"]
}
```

**说明**: `parent_answer_id` 为空表示直接回答问题，有值表示回复某个回答

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/answers/create" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "parent_answer_id": null,
    "content": "回答内容",
    "images": ["http://example.com/image1.jpg"]
  }'
```

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

---

### 5.2 修改回答
**接口**: `PUT /api/answers/update/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**请求体** (所有字段可选):
```json
{
  "content": "新回答内容",
  "images": ["http://example.com/image2.jpg"]
}
```

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/answers/update/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "新回答内容"
  }'
```

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

---

### 5.3 获取问题的回答列表
**接口**: `GET /api/answers/list/question/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认50

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/answers/list/question/1?page=1&page_size=50" \
  -H "gw_session: your_session_token_here"
```

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
        "images": [],
        "answerer_code": "002",
        "answerer_name": "李四",
        "is_official": 0,
        "is_pinned": 0,
        "points_awarded": 10,
        "is_useful": 0,
        "like_count": 3,
        "view_count": 5,
        "favorite_count": 1,
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
            "is_official": 0,
            "is_pinned": 0,
            "points_awarded": 0,
            "is_useful": 0,
            "like_count": 1,
            "view_count": 2,
            "favorite_count": 0,
            "create_time": "2024-01-01T13:00:00"
          }
        ]
      }
    ]
  }
}
```

---

### 5.4 获取回答详情
**接口**: `GET /api/answers/detail/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/answers/detail/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer_id": 1,
    "question_id": 1,
    "parent_answer_id": null,
    "question_title": "问题标题",
    "content": "回答内容",
    "images": [],
    "answerer_code": "002",
    "answerer_name": "李四",
    "is_official": 0,
    "is_pinned": 0,
    "points_awarded": 10,
    "is_useful": 0,
    "like_count": 3,
    "view_count": 5,
    "create_time": "2024-01-01T12:00:00",
    "replies": []
  }
}
```

---

### 5.5 我的被采纳回答
**接口**: `GET /api/answers/my-useful`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/answers/my-useful?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "回答内容...",
        "points_awarded": 20,
        "is_useful": 1,
        "like_count": 3,
        "view_count": 5,
        "favorite_count": 1,
        "create_time": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

---

### 5.6 标记回答为有用
**接口**: `POST /api/answers/useful/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**说明**: 只有提问人可以标记回答为有用

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/answers/useful/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

---

### 5.7 删除回答
**接口**: `DELETE /api/answers/delete/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/answers/delete/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 5.8 点赞/取消点赞回答
**接口**: `POST /api/answers/like/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/answers/like/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 5.9 收藏/取消收藏回答
**接口**: `POST /api/answers/favorite/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/answers/favorite/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 5.10 我的回答
**接口**: `GET /api/answers/my`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/answers/my?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "回答内容...",
        "points_awarded": 10,
        "is_useful": 0,
        "like_count": 3,
        "view_count": 5,
        "favorite_count": 1,
        "create_time": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

---

### 5.11 查看某个人的回答列表
**接口**: `GET /api/answers/list/by-user/{target_user_code}`

**路径参数**:
- `target_user_code` (string): 目标用户工号

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/answers/list/by-user/002?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "question_title": "问题标题",
        "content": "回答内容...",
        "images": [],
        "answerer_code": "002",
        "answerer_name": "李四",
        "is_official": 0,
        "is_pinned": 0,
        "points_awarded": 10,
        "is_useful": 0,
        "like_count": 3,
        "view_count": 5,
        "favorite_count": 1,
        "create_time": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

---

## 6. 话题相关接口

### 6.1 收藏/取消收藏话题
**接口**: `POST /api/topics/favorite/{topic_id}`

**路径参数**:
- `topic_id` (int): 话题ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/topics/favorite/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

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

---

### 6.2 我收藏的话题列表
**接口**: `GET /api/topics/my-favorite`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/topics/my-favorite?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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

---

### 6.3 获取话题列表
**接口**: `GET /api/topics/list`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/topics/list?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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

---

### 6.4 获取话题详情
**接口**: `GET /api/topics/detail/{topic_id}`

**路径参数**:
- `topic_id` (int): 话题ID

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/topics/detail/1" \
  -H "gw_session: your_session_token_here"
```

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

---

### 6.5 获取话题下的问题列表
**接口**: `GET /api/topics/questions/list/{topic_id}`

**路径参数**:
- `topic_id` (int): 话题ID

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/topics/questions/list/1?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "content": "问题内容...",
        "category": "求助类",
        "is_anonymous": 0,
        "asker_name": "张三",
        "status": 0,
        "view_count": 10,
        "like_count": 5,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

## 7. 消息相关接口

### 7.1 消息汇总
**接口**: `GET /api/messages/summary`

**说明**: 获取个人消息、部门消息、系统消息的未读数量

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/messages/summary" \
  -H "gw_session: your_session_token_here"
```

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

---

### 7.2 个人消息列表
**接口**: `GET /api/messages/personal`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20
- `is_read` (int, 可选): 是否已读（0未读，1已读）

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/messages/personal?page=1&page_size=20&is_read=0" \
  -H "gw_session: your_session_token_here"
```

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
        "target_code": null,
        "dept_id": null,
        "is_read": 0,
        "read_time": null,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 7.3 部门消息列表
**接口**: `GET /api/messages/department`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20
- `is_read` (int, 可选): 是否已读（0未读，1已读）

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/messages/department?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "unread_count": 3,
    "items": [
      {
        "message_id": 1,
        "message_type": "department",
        "title": "部门消息标题",
        "content": "部门消息内容",
        "target_type": "question",
        "target_id": 1,
        "target_code": null,
        "dept_id": 1,
        "is_read": 0,
        "read_time": null,
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 7.4 系统消息列表
**接口**: `GET /api/messages/system`

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/messages/system?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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

---

### 7.5 标记系统消息为已读
**接口**: `POST /api/messages/system/read`

**说明**: 更新用户最后查看系统消息的时间

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/messages/system/read" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

---

### 7.6 标记消息为已读
**接口**: `POST /api/messages/read/{message_id}`

**路径参数**:
- `message_id` (int): 消息ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/messages/read/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "标记成功"
}
```

---

### 7.7 标记所有消息为已读
**接口**: `POST /api/messages/read-all`

**查询参数**:
- `message_type` (string, 可选): 消息类型（personal, department, system）

**curl示例**:
```bash
# 标记所有个人消息为已读
curl -X POST "http://localhost:8000/api/messages/read-all?message_type=personal" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"

# 标记所有消息为已读
curl -X POST "http://localhost:8000/api/messages/read-all" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "已标记5条消息为已读",
  "data": {
    "count": 5
  }
}
```

---

### 7.8 删除消息
**接口**: `DELETE /api/messages/{message_id}`

**路径参数**:
- `message_id` (int): 消息ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/messages/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 8. 文件上传相关接口

### 8.1 上传单个文件
**接口**: `POST /api/upload/file`

**说明**: 上传单个文件到MinIO，支持图片、文档等格式，最大10MB

**请求**: multipart/form-data

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/upload/file" \
  -H "gw_session: your_session_token_here" \
  -F "file=@/path/to/your/file.pdf"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "文件上传成功",
  "data": {
    "file_url": "http://10.162.248.179:3003/forum-files/2024/01/01/file.pdf",
    "file_name": "file.pdf",
    "file_size": 102400
  }
}
```

---

### 8.2 上传多个文件
**接口**: `POST /api/upload/files`

**说明**: 上传多个文件，最多10个文件

**请求**: multipart/form-data

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/upload/files" \
  -H "gw_session: your_session_token_here" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.doc"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功上传 2 个文件",
  "data": {
    "files": [
      {
        "file_url": "http://10.162.248.179:3003/forum-files/2024/01/01/file1.pdf",
        "file_name": "file1.pdf",
        "file_size": 102400
      },
      {
        "file_url": "http://10.162.248.179:3003/forum-files/2024/01/01/file2.doc",
        "file_name": "file2.doc",
        "file_size": 204800
      }
    ],
    "success_count": 2,
    "error_count": 0,
    "errors": null
  }
}
```

---

### 8.3 上传单个图片
**接口**: `POST /api/upload/image`

**说明**: 专门用于问题/回答中的图片，只支持图片格式，最大5MB

**请求**: multipart/form-data

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/upload/image" \
  -H "gw_session: your_session_token_here" \
  -F "file=@/path/to/your/image.jpg"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "图片上传成功",
  "data": {
    "image_url": "http://10.162.248.179:3003/forum-files/2024/01/01/image.jpg",
    "file_name": "image.jpg",
    "file_size": 51200
  }
}
```

---

### 8.4 上传多个图片
**接口**: `POST /api/upload/images`

**说明**: 专门用于问题/回答中的图片，最多上传9张图片

**请求**: multipart/form-data

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/upload/images" \
  -H "gw_session: your_session_token_here" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功上传 2 张图片",
  "data": {
    "image_urls": [
      "http://10.162.248.179:3003/forum-files/2024/01/01/image1.jpg",
      "http://10.162.248.179:3003/forum-files/2024/01/01/image2.png"
    ],
    "success_count": 2,
    "error_count": 0,
    "errors": null
  }
}
```

---

## 9. 管理端相关接口

### 9.1 内容管理-问题列表
**接口**: `GET /api/admin/questions/list`

**说明**: 管理员查看问题列表（包括匿名用户真实身份）

**参数**:
- `category` (string, 可选): 问题分类
- `status` (int, 可选): 状态
- `dept_id` (int, 可选): 部门ID
- `keyword` (string, 可选): 关键词
- `start_time` (datetime, 可选): 开始时间
- `end_time` (datetime, 可选): 结束时间
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/questions/list?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
            "staff_code": "002",
            "staff_name": "李四"
          }
        ],
        "status": 0,
        "is_featured": 0,
        "is_offline": 0,
        "view_count": 10,
        "like_count": 5,
        "answer_count": 2,
        "create_time": "2024-01-01T10:00:00",
        "deadline": "2024-01-04T10:00:00",
        "days_remaining": 2,
        "topics": [
          {
            "topic_id": 1,
            "title": "话题1"
          }
        ]
      }
    ]
  }
}
```

---

### 9.2 标记精选
**接口**: `PUT /api/admin/questions/mark-featured/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**查询参数**:
- `is_featured` (int): 是否精选（0否，1是）

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/questions/mark-featured/1?is_featured=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功"
}
```

---

### 9.3 删除问题
**接口**: `DELETE /api/admin/questions/delete/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/admin/questions/delete/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 9.4 删除回答
**接口**: `DELETE /api/admin/answers/delete/{answer_id}`

**路径参数**:
- `answer_id` (int): 回答ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/admin/answers/delete/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 9.5 问题下线/上线
**接口**: `PUT /api/admin/questions/offline/{question_id}`

**路径参数**:
- `question_id` (int): 问题ID

**查询参数**:
- `is_offline` (int): 是否下线（0上线，1下线）

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/questions/offline/1?is_offline=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功"
}
```

---

### 9.6 人力转办
**接口**: `POST /api/admin/questions/transfer/{question_id}`

**说明**: 仅超级管理员可以操作，转办问题到多个部门

**路径参数**:
- `question_id` (int): 问题ID

**请求体**:
```json
{
  "dept_ids": [1, 2],
  "topic_ids": [1, 2]
}
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/admin/questions/transfer/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_ids": [1, 2],
    "topic_ids": [1, 2]
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "转办成功"
}
```

---

### 9.7 创建话题
**接口**: `POST /api/admin/topics/create`

**请求体**:
```json
{
  "title": "话题标题",
  "description": "话题描述",
  "cover_image": "http://example.com/cover.jpg"
}
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/admin/topics/create" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "话题标题",
    "description": "话题描述",
    "cover_image": "http://example.com/cover.jpg"
  }'
```

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

---

### 9.8 更新话题
**接口**: `PUT /api/admin/topics/update/{topic_id}`

**路径参数**:
- `topic_id` (int): 话题ID

**请求体** (所有字段可选):
```json
{
  "title": "新标题",
  "description": "新描述",
  "cover_image": "http://example.com/new_cover.jpg",
  "status": 1
}
```

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/topics/update/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新标题",
    "description": "新描述"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

### 9.9 创建奖励规则
**接口**: `POST /api/admin/reward-rules/create`

**请求体**:
```json
{
  "rule_name": "发布问题奖励",
  "rule_code": "question",
  "points": 30,
  "rule_description": "发布问题奖励30积分",
  "conditions": {
    "min_length": 10
  }
}
```

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/admin/reward-rules/create" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "rule_name": "发布问题奖励",
    "rule_code": "question",
    "points": 30,
    "rule_description": "发布问题奖励30积分",
    "conditions": {
      "min_length": 10
    }
  }'
```

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

---

### 9.10 获取奖励规则列表
**接口**: `GET /api/admin/reward-rules/list`

**参数**:
- `status` (int, 可选): 状态
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认50

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/reward-rules/list?page=1&page_size=50" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "rule_id": 1,
        "rule_name": "发布问题奖励",
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

---

### 9.11 更新奖励规则
**接口**: `PUT /api/admin/reward-rules/update/{rule_id}`

**路径参数**:
- `rule_id` (int): 规则ID

**请求体** (只允许修改points和rule_description):
```json
{
  "points": 50,
  "rule_description": "发布问题奖励50积分"
}
```

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/reward-rules/update/1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 50,
    "rule_description": "发布问题奖励50积分"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

### 9.12 删除奖励规则
**接口**: `DELETE /api/admin/reward-rules/delete/{rule_id}`

**路径参数**:
- `rule_id` (int): 规则ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/admin/reward-rules/delete/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 9.13 用户列表
**接口**: `GET /api/admin/staffs/list`

**参数**:
- `dept_id` (int, 可选): 部门ID
- `forum_tag` (string, 可选): 论坛标签
- `keyword` (string, 可选): 关键词（工号或姓名）
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认20

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/staffs/list?page=1&page_size=20" \
  -H "gw_session: your_session_token_here"
```

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
        "departments": [
          {
            "dept_id": 1,
            "dept_code": "TECH",
            "dept_name": "技术部",
            "full_name": "技术部"
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

---

### 9.14 操作日志
**接口**: `GET /api/admin/logs/list`

**参数**:
- `user_code` (string, 可选): 用户工号
- `operation_type` (string, 可选): 操作类型
- `start_time` (datetime, 可选): 开始时间
- `end_time` (datetime, 可选): 结束时间
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认100

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/logs/list?page=1&page_size=100" \
  -H "gw_session: your_session_token_here"
```

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
        "operation_type": "question_delete",
        "target_type": "question",
        "target_id": 1,
        "content": "删除问题：问题标题",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "create_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 9.15 查看操作记录详情
**接口**: `GET /api/admin/logs/{log_id}`

**路径参数**:
- `log_id` (int): 日志ID

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/logs/1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "log_id": 1,
    "user_code": "001",
    "user_name": "张三",
    "operation_type": "question_delete",
    "target_type": "question",
    "target_id": 1,
    "content": "删除问题：问题标题",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "create_time": "2024-01-01T10:00:00"
  }
}
```

---

### 9.16 添加部门管理员
**接口**: `POST /api/admin/dept-admins`

**说明**: 仅超级管理员可以操作

**查询参数**:
- `staff_code` (string): 员工工号
- `dept_id` (int): 部门ID

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/admin/dept-admins?staff_code=002&dept_id=1" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "staff_code": "002",
    "dept_id": 1
  }
}
```

---

### 9.17 获取部门管理员列表
**接口**: `GET /api/admin/dept-admins`

**说明**: 仅超级管理员可以查看

**参数**:
- `dept_id` (int, 可选): 部门ID
- `staff_code` (string, 可选): 员工工号

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/dept-admins?dept_id=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "staff_code": "002",
        "staff_name": "李四",
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

---

### 9.18 删除部门管理员
**接口**: `DELETE /api/admin/dept-admins`

**说明**: 仅超级管理员可以操作

**查询参数**:
- `staff_code` (string): 员工工号
- `dept_id` (int): 部门ID

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/admin/dept-admins?staff_code=002&dept_id=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 9.19 禁用/取消禁用员工
**接口**: `PUT /api/admin/staffs/forbidden/{staff_code}`

**说明**: 仅超级管理员可以操作

**路径参数**:
- `staff_code` (string): 员工工号

**查询参数**:
- `is_forbidden` (int): 是否禁用（0取消禁用，1禁用）

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/staffs/forbidden/002?is_forbidden=1" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "禁用成功"
}
```

---

### 9.20 取消/恢复部门管理员权限
**接口**: `PUT /api/admin/dept-admins/status/{staff_code}`

**说明**: 仅超级管理员可以操作

**路径参数**:
- `staff_code` (string): 员工工号

**查询参数**:
- `dept_id` (int): 部门ID
- `status` (int): 状态（0取消权限，1恢复权限）

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/dept-admins/status/002?dept_id=1&status=0" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "取消权限成功"
}
```

---

### 9.21 查看员工积分
**接口**: `GET /api/admin/staffs/points/{staff_code}`

**说明**: 仅超级管理员可以操作

**路径参数**:
- `staff_code` (string): 员工工号

**参数**:
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页大小，默认50

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/staffs/points/002?page=1&page_size=50" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "staff_code": "002",
    "staff_name": "李四",
    "total_points": 150,
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

---

### 9.22 调整员工积分
**接口**: `PUT /api/admin/staffs/points/{staff_code}`

**说明**: 仅超级管理员可以操作

**路径参数**:
- `staff_code` (string): 员工工号

**查询参数**:
- `current_points` (int): 当前积分
- `new_points` (int): 调整后的积分

**curl示例**:
```bash
curl -X PUT "http://localhost:8000/api/admin/staffs/points/002?current_points=150&new_points=200" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "调整成功",
  "data": {
    "staff_code": "002",
    "current_points": 150,
    "new_points": 200,
    "points_diff": 50
  }
}
```

---

### 9.23 添加超级管理员
**接口**: `POST /api/admin/super-admins`

**说明**: 仅超级管理员可以操作

**查询参数**:
- `staff_code` (string): 员工工号

**curl示例**:
```bash
curl -X POST "http://localhost:8000/api/admin/super-admins?staff_code=003" \
  -H "gw_session: your_session_token_here" \
  -H "Content-Type: application/json"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "staff_code": "003"
  }
}
```

---

### 9.24 获取超级管理员列表
**接口**: `GET /api/admin/super-admins`

**说明**: 仅超级管理员可以查看

**参数**:
- `status` (int, 可选): 状态

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/super-admins" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "staff_code": "003",
        "staff_name": "王五",
        "status": 1,
        "create_time": "2024-01-01T10:00:00",
        "update_time": "2024-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 9.25 删除超级管理员
**接口**: `DELETE /api/admin/super-admins/{staff_code}`

**说明**: 仅超级管理员可以操作，不能删除自己

**路径参数**:
- `staff_code` (string): 员工工号

**curl示例**:
```bash
curl -X DELETE "http://localhost:8000/api/admin/super-admins/003" \
  -H "gw_session: your_session_token_here"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 9.26 Dashboard
**接口**: `GET /api/admin/dashboard`

**说明**: Dashboard统计（支持时间段筛选）

**参数**:
- `start_time` (datetime, 可选): 开始时间
- `end_time` (datetime, 可选): 结束时间

**curl示例**:
```bash
curl -X GET "http://localhost:8000/api/admin/dashboard" \
  -H "gw_session: your_session_token_here"

# 带时间筛选
curl -X GET "http://localhost:8000/api/admin/dashboard?start_time=2024-01-01T00:00:00&end_time=2024-01-31T23:59:59" \
  -H "gw_session: your_session_token_here"
```

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
        "resolved_count": 35,
        "resolution_rate": 70.0,
        "timeout_count": 5,
        "avg_reply_time": 2.5
      }
    ],
    "topic_ranking": [
      {
        "topic_id": 1,
        "title": "话题1",
        "popularity": 100
      }
    ]
  }
}
```

---

## 10. 根路径和健康检查

### 10.1 根路径
**接口**: `GET /`

**curl示例**:
```bash
curl -X GET "http://localhost:8000/"
```

**响应示例**:
```json
{
  "message": "问答社区系统API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

### 10.2 健康检查
**接口**: `GET /health`

**curl示例**:
```bash
curl -X GET "http://localhost:8000/health"
```

**响应示例**:
```json
{
  "status": "ok"
}
```

---

## 注意事项

1. **认证**: 所有需要认证的接口都需要在请求头中携带 `gw_session`
2. **文件上传**: 文件上传接口使用 `multipart/form-data` 格式
3. **时间格式**: 所有时间字段使用 ISO 8601 格式（如：`2024-01-01T10:00:00`）
4. **分页**: 分页参数从1开始，不是从0开始
5. **权限**: 管理端接口需要相应的管理员权限
6. **错误处理**: 所有错误都会返回相应的HTTP状态码和错误信息

## 错误码说明

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误
