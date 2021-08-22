/**
 * @license Copyright (c) 2014-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';

class Editor extends DecoupledDocumentEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Alignment,
	Autoformat,
	BlockQuote,
	Bold,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Base64UploadAdapter,
	HorizontalLine,
	Image,
	ImageUpload,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	Indent,
	IndentBlock,
	Italic,
	Link,
	List,
	ListStyle,
	Paragraph,
	RemoveFormat,
	TextTransformation,
	TodoList,
	Underline,
	function ConvertQuoteAttribute(editor) {
		// Allow <blockquote> elements in the model to have all attributes.
		editor.model.schema.addAttributeCheck((context) => {
			if (context.endsWith('blockQuote')) {
				return true;
			}
		});
		// The view-to-model converter converting a view <blockquote> with all its attributes to the model.
		editor.conversion.for('upcast').elementToElement({
			view: 'blockquote',
				model: (viewElement, { writer: modelWriter }) => {
					return modelWriter.createElement('blockQuote', viewElement.getAttributes());
				},
		});

		// The model-to-view converter for the <blockquote> element (attributes are converted separately).
		editor.conversion.for('downcast').elementToElement({
			model: 'blockQuote',
			view: 'blockquote',
		});

		// The model-to-view converter for <blockquote> attributes.
		// Note that a lower-level, event-based API is used here.
		editor.conversion.for('downcast').add((dispatcher) => {
			dispatcher.on('attribute', (evt, data, conversionApi) => {
				// Convert <blockquote> attributes only.
				if (data.item.name !== 'blockQuote') {
					return;
				}
				const viewWriter = conversionApi.writer;
				const viewBlockQuote = conversionApi.mapper.toViewElement(data.item);

				// In the model-to-view conversion we convert changes.
				// An attribute can be added or removed or changed.
				if (data.attributeNewValue && data.attributeKey !== 'style') {
					viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewBlockQuote);
				} else {
					viewWriter.removeAttribute(data.attributeKey, viewBlockQuote);
				}
			});
		});
	},
	function ConvertDivAttributes( editor ) {
		// Allow <div> elements in the model.
		editor.model.schema.register( 'div', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <div> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'div',
			model: 'div'
		} );
	
		// The model-to-view converter for the <div> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'div',
			view: 'div'
		} );
		editor.model.schema.extend( 'div', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'div'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:div', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	},
	function ConvertTableAttributes( editor ) {
		// Allow <table> elements in the model.
		editor.model.schema.register( 'table', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <table> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'table',
			model: 'table'
		} );
	
		// The model-to-view converter for the <table> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'table',
			view: 'table'
		} );


		editor.model.schema.extend( 'table', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'table'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:table', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	},
	function ConvertTrAttributes( editor ) {
		// Allow <tr> elements in the model.
		editor.model.schema.register( 'tr', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <tr> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'tr',
			model: 'tr'
		} );
	
		// The model-to-view converter for the <tr> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'tr',
			view: 'tr'
		} );


		editor.model.schema.extend( 'tr', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'tr'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:tr', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	},
	function ConvertTdAttributes( editor ) {
		// Allow <td> elements in the model.
		editor.model.schema.register( 'td', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <td> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'td',
			model: 'td'
		} );
	
		// The model-to-view converter for the <td> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'td',
			view: 'td'
		} );


		editor.model.schema.extend( 'td', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'td'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:td', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	},
	function ConvertTbodyAttributes( editor ) {
		// Allow <tbody> elements in the model.
		editor.model.schema.register( 'tbody', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <td> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'tbody',
			model: 'tbody'
		} );
	
		// The model-to-view converter for the <td> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'tbody',
			view: 'tbody'
		} );


		editor.model.schema.extend( 'tbody', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'tbody'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:tbody', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	},
	// Allow pre tag
	function ConvertPreAttributes( editor ) {
		// Allow <pre> elements in the model.
		editor.model.schema.register( 'pre', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
	
		// The view-to-model converter converting a view <pre> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'pre',
			model: 'pre'
		} );
	
		// The model-to-view converter for the <pre> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'pre',
			view: 'pre'
		} );
		editor.model.schema.extend( 'pre', { allowAttributes: '__style' } );

		editor.conversion.for('upcast').attributeToAttribute({
			model: {
				key: '__style',
				name: 'pre'
			},
			view: 'style'
		});

		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('attribute:__style:pre', (evt, data, conversionApi) => {
				const viewElement = conversionApi.mapper.toViewElement(data.item);

				conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
			});
		});
	}
];

const toolbarItems = [
    'fontfamily',
    'fontsize',
    '|',
    'bold',
    'italic',
    'underline',
    '|',
    'alignment',
    '|',
    'fontcolor',
    'fontbackgroundcolor',
    '|',
    'bulletedlist',
    'numberedlist',
    '|',
    'indent',
    'outdent',
    '|',
	'undo',
	'redo',
	'|',
    'removeformat',
  ];

  const editorConfig = {
    fontSize: {
      options: [
        {
          title: 'Tiny',
          model: '10px',
        },
        {
          title: 'Small',
          model: '12px',
        },
        'default',
        {
          title: 'Big',
          model: '24px',
        },
        {
          title: 'Huge',
          model: '40px',
        },
      ],
      supportAllValues: true,
    },
    toolbar: {
      items: toolbarItems,
      shouldNotGroupWhenFull: true,
    },
  };

  Editor.defaultConfig = editorConfig;

export default Editor;