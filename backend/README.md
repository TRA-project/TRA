# travel_backend
 BUAA Software Engineering 2022 Homework

### TIPS

- 推荐以下Django教学视频
  - Django基础：https://www.bilibili.com/video/BV1vK4y1o7jH?share_source=copy_web
  - DRF教材：https://www.bilibili.com/video/BV1XR4y157rk?share_source=copy_web
- DRF中文文档：https://q1mi.github.io/Django-REST-framework-documentation/

 ### FAQ

 - 如何携带凭证使用API？

   对于管理端，在请求头里添加`Authorization`，取值为`Bearer <token>`。

   对于客户端，在请求头里添加`token-auth`，取值为`<token>`。

### admin/

Django自带的管理工具，具体查阅Django文档

### api/

在API请求成功时，将会返回应返回的内容；否则将返回一个指定格式的错误信息。错误信息格式如下：

```json
{
    "error_code": 400, // 错误代码
    "detail": "" // 详细信息，可能为字符串、数组或json对象
}
```

- #### user/

  需要携带管理端凭证。

  携带方式：

  ```json
  // Headers
  {
      "Authentication": "Bearer xxxxxxxx"
  }
  ```

  - `GET /api/user/`

    获取所有管理端用户信息

    ##### 参数：

    N/A

    ##### 返回值 (成功)

    Status: 200

    ```json
    {
        "count": 1,
        "next": null, // 每一页返回数量有限，该参数表示上一页URL
        "previous": null, // 每一页返回数量有限，该参数表示下一页URL
        "results": [
            {
                "username": "admin",
                "email": ""
            }
        ]
    }
    ```

  - `GET /api/user/<username>/`

    获取管理端用户信息

    ##### 参数：

    N/A

    ##### 返回值 (成功)

    Status: 200

    ```json
    {
        "username": "admin",
        "email": ""
    }
    ```

  - `POST /api/user/`

    创建管理端用户

    ##### 参数：

    ```json
    {
        "username": 用户名,
        "password": 密码,
        ["email": 邮箱,]
        ["is_superuser": 是否为超级用户(仅限超级用户设置),]
    }
    ```

    ##### 返回值 (成功)

    Status: 201

    无返回值

  - `PUT /api/user/<username>/`

    修改管理端用户信息

    ##### 参数：

    ```json
    {
        ["username": 用户名,]
        ["password": 密码,]
        ["email": 邮箱,]
    }
    ```

    ##### 返回值 (成功)

    Status: 200

    无返回值

  - `DELETE /api/user/<username>/`

    删除管理端用户

    ##### 参数：

    N/A

    ##### 返回值 (成功)

    Status: 204

    无返回值  

- #### token-auth/

  - `POST /api/token-auth/`

    获取管理端用户凭证

    ##### 参数：

    ```json
    {
        "username": 用户名,
        "password": 密码
    }
    ```

    ##### 返回值 (成功)

    Status: 200

    ```json
    {
        "refresh": 刷新凭证,
        "access": 访问凭证 // 凭证使用JWT格式
    }
    ```

- #### token-refresh/

  - `POST /api/token-refresh/`

    使用刷新凭证刷新管理端访问凭证

    ##### 参数：

    ```json
    {
        "refresh": 刷新凭证
    }
    ```
    
  
   ##### 返回值 (成功)
  
   Status: 200
      
  
   ```json
    {
        "access": 访问凭证
    }
   ```


- #### core/

  Django REST Framework提供的ModelViewSet默认提供以下API，以后不再赘述。注意所有API的默认URL均以`/`结尾，Django不提供自动重定向功能，故不可省略`/`。

  ```json
  // GET <basepath>/<view>/   对全体对象进行检索
  	// 参数
  	null
  	// 返回值
      {
          "count": 对象总数,
          "next": 下一页URL或null,
          "previous": 上一页URL或null,
          "results": [
              {
                  /* ... */
              }, // ...
          ]
      }
  // POST <basepath>/<view>/   创建对象
  	// 参数
  	{
          /* 对象包含的所需参数, 非必需参数可不传递 */
      }
  	// 返回值
      {
          /* 所创建对象的所有可见属性 */
      }
  // GET <basepath>/<view>/<primary_key>/   检索特定对象
  	// 参数
  	null
  	// 返回值
      {
          /* 所检索对象的所有可见属性 */
      }
  // DELETE <basepath>/<view>/<primary_key>/   删除特定对象
  	// 参数
  	null
  	// 返回值
      {
          /* 所删除对象的所有可见属性 */
      }
  // PUT <basepath>/<view>/<primary_keys>/   修改对象
  	// 参数
  	{
          /* 可包含对象必需的部分参数, 可包含非必需参数 */
      }
  	// 返回值
      {
          /* 所创建对象的所有可见属性 */
      }
  ```

  - ##### users/

    应用端用户信息的API。该API系列不提供列表检索功能，即不提供`GET /api/core/users/`。

    使用该系列API，在携带用户登录凭证或管理端登录凭证时会有更详细的结果。携带用户登录凭证的方法：

    ```json
    // Headers
    {
        "token-auth": "xxxxxxxx"
    }
    ```

    用户登录凭证为JWT格式。**注意，为了避免冲突，该凭证和管理端登录凭证的设置方式不同。**

    不携带凭证时的信息：

    ```json
    {
        "id": 2,
        "position": null,
        "name": "1234",
        "nickname": "",
        "gender": 0,
        "sign": "",
        "email": "",
        "phone": "",
        "birthday": null,
        "icon": "v8cjohwSeE7DcvWULC2DZw0H4g1maC8i",
        "subscription": 1,
        "subscribers": 0,
        "likes": 1
    }
    ```

    携带凭证时的信息：

    ```json
    {
        "id": 2,
        "position": null,
        "name": "1234",
        "nickname": "",
        "gender": 0,
        "sign": "",
        "email": "",
        "phone": "",
        "birthday": null,
        "icon": "v8cjohwSeE7DcvWULC2DZw0H4g1maC8i",
        "subscription": 1,
        "subscribers": 0,
        "likes": 1,
        "collection": 0,
        "received_messages": 0
    }
    ```

    - `POST /api/core/users/`

      创建用户
      
      除必要信息外，需要附加：
      
      ```json
      {
          "js_code": "xxxxxxxx" /* 微信登录凭证 */
      }
      ```

      ##### 错误代码

      **601** 用户名已经存在

    - `PUT /api/core/users/`

      修改用户信息，注意该API使用用户凭证确认用户身份，而非使用URL。
      
      ##### 错误代码
      
      **604** 无效用户（发生于用户已注销账号等场景）
      
    - `POST /api/core/users/login/`
    
      用户登录

      ##### 参数：

      ```json
      {
          "name": 用户名,
          "password": 密码明文
      }
      ```
    
      ##### 返回值 (成功)
      
      Status: 200
      
      ```json
      {
          "error_code": 200, // 成功
          "data": {
              "token": "xxxxxxxx" // 用户登录凭证
          }
      }
      ```
      
      ##### 错误代码
      
      **600** 用户名或密码错误
  
    - `POST /api/core/users/subscribe/`
  
      订阅其他用户
  
        ##### 参数：
    
        ```json
        {
            "id": 用户ID或ID列表,
            /* 列表支持格式：
             *  1. [1, 2, 3]
             *  2. "[1, 2, 3]"
             *  3. "1,2,3"
             */
             ["cancel": 是否取消订阅(默认为false),]
        }
        ```
    
        ##### 返回值 (成功)
    
        Status: 200
    
        无返回值
  
    - `POST /api/core/users/collect/`
    
      收藏游记
    
      ##### 参数：
    
      ```json
      {
          "id": 游记ID或ID列表,
          ["cancel": 是否取消收藏(默认为false),]
      }
      ```
    
      ##### 返回值 (成功)
    
      Status: 200
    
      无返回值
    
    - `POST /api/core/users/join/`
  
      加入同行
    
      ##### 参数：
    
      ```json
      {
          "id": 同行ID或ID列表,
          ["cancel": 是否取消加入(默认为false),]
      }
      ```
  
      ##### 返回值 (成功)
  
      Status: 200
    
      无返回值

    - `GET /api/core/history/`
  
      查询用户的足迹
    
      ##### 参数：
    
      无
    
      ##### 返回值 (成功)
  
      Status: 200
  
      ```json
      {
          "error_code": 200,
          "data": [ // 按时间降序排列
              {
                  "time": "2021-04-15T08:27:10.481581Z",
                  "positions": [
                      1 // 游记的所有位置对象的ID
                  ]
              },
              {
                  "time": "2021-04-15T08:26:47.991709Z",
                  "positions": [
                      1,
                      2
                  ]
              }
          ]
      }
      ```
    
    - `POST /api/core/users/icon/`
  
      上传当前用户头像
    
      ##### 参数：
    
      ```json
      {
          "image": FileObject() // 上传的图片
      }
      ```
    
      ##### 返回值 (成功)
    
      Status: 200
    
      ```json
      {
          "id": "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM" // 图片ID
      }
      ```
  
    - `DELETE /api/core/users/icon/`
  
      删除当前用户头像
    
      ##### 参数：
    
      ```json
      {
          "image": "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM" // 图片ID
      }
      ```
    
      ##### 返回值 (成功)
    
      Status: 200
    
      无返回值
    
  - ##### travels/
  
    游记的API。
  
    游记在生成时必须传递位置对象ID的数组。
  
    **注意：暂时设计为每次对`GET /api/core/travels/<id>/`的访问都造成一次游记阅读量上升。**
    
    查询游记的返回值如下：
    
    ```json
    {
        "id": 1,
        "owner": 2,
        "cover": null, // 图片对象的ID，字符串
        "images": [
            "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM"
        ],
        "positions": [ // 在创建时必须以数组形式传递，可以为空
            1,
            2
        ],
        "likes": 0,
        "time": "2021-04-15T18:35:46.085210+08:00", // 自动使用当前时间，建议不传
        "title": "",
        "content": "",
        "read_total": 7,
        "last_read": "2021-04-15T18:35:46.085210+08:00"
  }
    ```
  
    - `POST /api/core/travels/like/`
  
      点赞或取消点赞（必须携带用户凭证）
    
      ##### 参数：
  
      ```json
    {
          ["cancel": 是否取消加入(默认为false),]
    }
      ```
      
      ##### 返回值 (成功)
      
      Status: 200
    
      无返回值
  
    - `POST /api/core/travels/<id>/image/`
  
      上传图片
    
      ##### 参数：
    
      ```json
    {
          "image": FileObject() // 上传的图片
    }
      ```
      
      ##### 返回值 (成功)
      
      Status: 200
      
      ```json
      {
          "id": "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM" // 图片ID
    }
      ```
  
    - `DELETE /api/core/travels/<id>/image/`
  
      删除图片
    
      ##### 参数：
    
      ```json
    {
          "image": ["2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM"] // 图片ID列表
    }
      ```
      
      ##### 返回值 (成功)
      
      Status: 200
      
      无返回值
      
    - `POST /api/core/travels/<id>/cover/`
  
      上传封面
  
      ##### 参数：
  
      ```json
    {
          "image": FileObject() // 上传的图片
    }
      ```
    
      ##### 返回值 (成功)
      
      Status: 200
      
      ```json
      {
          "id": "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM" // 图片ID
      }
      ```
      
    - `DELETE /api/core/travels/<id>/cover/`
  
      删除封面
  
      ##### 参数：
  
      无
    
      ##### 返回值 (成功)
    
      Status: 200
    
      无返回值
    
  - ##### comments/
  
  - ##### position/
  
  - ##### messages/
  
  - ##### images/
  
    所有图片的API。下载图片必须使用该系列API。
  
    客户端的图片API仅支持创建和查询。
  
    查询单个图片返回的结果如下，其中只有`image`必须传递：
  
    ```json
    {
        "id": "2VyIQYqjAhSXQ6R9HlHZ0QWnz7cq9CsM",
        "time": "2021-04-13T23:43:26.072249+08:00",
        "description": "",
        "image": "test.jpg"
    }
    ```
  
    - `GET /api/core/images/<id>/data/`
  
      下载图片
  
      ##### 参数：
  
      无
  
      ##### 返回值 (成功)
  
      Status: 200
  
      响应类型为`image/<format>`，返回图片内容。
  
- #### admin/

  - ##### users/

  - ##### travels/

  - ##### comments/

  - ##### position/

  - ##### messages/
```

```