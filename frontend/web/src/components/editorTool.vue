
<template>
  <div class="editor-tool" style="border:red 1px solid">
    <a-button class="btn" v-on:click="getContent">发送</a-button>
    <div id = "editor" class="text" ref="editor" style="text-align: left;margin:10px 0;width:800px"></div>
  </div>
</template>

<script>
import E from "wangeditor";

export default {
  name: "editor",
  props: {
    content: {
      type: String,
    },
  },
  data() {
    return {
      editorContent: "",
    };
  },
  methods: {
    getContent: function() {
      this.$emit("Edit", this.editorContent);
    },
  },
  watch: {
    content: function(newVal) {
      this.editorContent = newVal;
    },
  },
  mounted() {
    const editor = new E( document.getElementById('editor') )
    // const editor = new E(this.$refs.editor);
    editor.config.onchange = (html) => {
      console.log(html);
      this.editorContent = html;
    };
   
    editor.create();
    // editor.txt.html(this.editorContent);
  },
};
</script>
<style scoped>

.text {
  margin:10px;
  border: 1px solid #ccc;
  min-height: 400px;
}
</style>

