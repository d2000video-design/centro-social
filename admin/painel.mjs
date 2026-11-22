
import { renderPage } from './render.mjs';

const response = await fetch('./config.yml');
if (!response.ok) throw new Error('Não foi possível carregar o painel.');
const config = await response.json();
config.backend.base_url = window.location.origin;
const {CMS, createClass, h} = window;

for (const {name} of config.collections[0].files) {
  const templateUrl = '/modelos/' + name + '.html';
  CMS.registerPreviewTemplate(name, createClass({
    getInitialState() {
      return {template: null, error: false};
    },
    componentDidMount() {
      this.request = new AbortController();
      fetch(templateUrl, {signal: this.request.signal})
        .then(result => {
          if (!result.ok) throw new Error('Pré-visualização indisponível.');
          return result.text();
        })
        .then(template => this.setState({template}))
        .catch(error => {
          if (error.name !== 'AbortError') this.setState({error: true});
        });
    },
    componentWillUnmount() {
      this.request.abort();
    },
    render() {
      if (this.state.error) return h('p', {}, 'Pré-visualização indisponível.');
      if (!this.state.template) return h('p', {}, 'A carregar a pré-visualização…');
      const srcDoc = renderPage(this.state.template, this.props.entry.get('data').toJS(), {
        preview: true,
        origin: window.location.origin,
        asset: (value, path) => {
          const resolved = String(this.props.getAsset(value));
          return /^(blob:|data:image\/(?:jpeg|png|webp);base64,)/i.test(resolved) ? resolved : path;
        }
      });
      return h('iframe', {
        title: 'Pré-visualização da página',
        sandbox: 'allow-same-origin',
        srcDoc,
        style: {width:'100%', height:'95vh', border:0}
      });
    }
  }));
}
CMS.init({config});
