import React, { Component } from "react";
import Subject from "./components/Subject";
import TOC from "./components/TOC";
import Content from "./components/Content";
import "./App.css";

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
  }
  render() {
    let _title,
      _desc = null;
    if (this.state.mode === "welcome") {
      _title = this.state.welcome.title;
      _desc = this.state.welcome.desc;
    } else if (this.state.mode === "read") {
      const index = this.state.selected_content_id - 1;
      _title = this.state.contents[index].title;
      _desc = this.state.contents[index].desc;
    }
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
        <Content title={_title} desc={_desc}></Content>
      </div>
    );
  }
}

export default App;
