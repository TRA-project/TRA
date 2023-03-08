// pages/ReleasePal/Component/edit_keyboard.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        showEditor: {
            type: Boolean
        },
        addtag: {
            type: String
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        addtag: '1526'
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 关闭编辑器
        switchEditor(e) {
            this.triggerEvent('editor-switch', false)
            console.log('close in edit')
            /*this.setData({
              addNumStr: "0",
              // showEditor: false
            })*/
          },

          addnewtag(e) {
            var newstring = this.data.addtag
            console.log('tag in sub ', newstring)
            this.triggerEvent('add-newtag', newstring)
            this.triggerEvent('editor-switch', false)
            this.setData({
                addtag: ''
            })
        },

        handleinput(e) {
            console.log('input ob', e.detail)
            this.setData({
                addtag: e.detail.value
            })
        }
    }
})
