import React, { Component } from "react";
import Subject from "./components/Subject";
import TOC from "./components/TOC";
import ReadContent from "./components/ReadContent";
import Control from "./components/Control";
import "./App.css";
import CreateContent from "./components/CreateContent";
import UpdateContent from "./components/UpdateContent";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "welcome",
      selected_content_id: 2,
      subject: { title: "WEB", sub: "world wide web!" },
      welcome: { title: "welcome", desc: "Hello, React!!" },
      contents: [
        {
          id: 1,
          title: "HTML",
          desc: "HTML is HyperText Markup Language.",
        },
        {
          id: 2,
          title: "CSS",
          desc: "CSS is for design.",
        },
        {
          id: 3,
          title: "JavaScript",
          desc: "JavaScript is for interactive",
        },
      ],
    };
    this.max_content_id = this.state.contents.length;
  }

  getReadContent() {
    let i = 0;
    let data;
    while (i < this.state.contents.length) {
      data = this.state.contents[i];
      if (data.id === this.state.selected_content_id) return data;
      i++;
    }
  }

  getContent() {
    let _title,
      _desc,
      _article = null;
    if (this.state.mode === "welcome") {
      _title = this.state.welcome.title;
      _desc = this.state.welcome.desc;
      _article = <ReadContent title={_title} desc={_desc}></ReadContent>;
    } else if (this.state.mode === "read") {
      const _content = this.getReadContent();
      _article = (
        <ReadContent title={_content.title} desc={_content.desc}></ReadContent>
      );
    } else if (this.state.mode === "create") {
      _article = (
        <CreateContent
          onSubmit={(_title, _desc) => {
            this.max_content_id++;
            let newContent = Array.from(this.state.contents);
            newContent.push({
              id: this.max_content_id,
              title: _title,
              desc: _desc,
            });
            this.setState({
              contents: newContent,
            });
          }}
        ></CreateContent>
      );
    } else if (this.state.mode === "update") {
      const _content = this.getReadContent();
      _article = (
        <UpdateContent
          data={_content}
          onSubmit={(_id, _title, _desc) => {
            let _content = Array.from(this.state.contents);
            let i = 0;
            while (i < _content.length) {
              if (_content[i].id === _id) {
                _content[i] = { id: _id, title: _title, desc: _desc };
                break;
              }
              i++;
            }
            this.setState({
              contents: _content,
              mode: "read",
            });
          }}
        ></UpdateContent>
      );
    }
    return _article;
  }
  render() {
    return (
      <div className="App">
        <Subject
          title={this.state.subject.title}
          sub={this.state.subject.sub}
          onChangePage={() => {
            this.setState({ mode: "welcome" });
          }}
        ></Subject>
        <TOC
          data={this.state.contents}
          onChangePage={(id) => {
            this.setState({
              mode: "read",
              selected_content_id: Number(id),
            });
          }}
        ></TOC>
        <Control
          onChangeMode={(_mode) => {
            this.setState({ mode: _mode });
          }}
        ></Control>
        {this.getContent()}
      </div>
    );
  }
}

export default App;
