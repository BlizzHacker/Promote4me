/* global tinymce, FusionPageBuilderApp, openShortcodeGenerator */
( function( $ ) {

	if ( 'undefined' !== typeof tinymce && 'undefined' !== typeof FusionPageBuilderApp ) {

		tinymce.PluginManager.add( 'fusion_button', function( editor ) {

			if ( ( ( true === FusionPageBuilderApp.allowShortcodeGenerator && true !== FusionPageBuilderApp.shortcodeGenerator ) || 'content' === editor.id || 'excerpt' === editor.id ) || ( ( jQuery( 'body' ).hasClass( 'gutenberg-editor-page' ) || jQuery( 'body' ).hasClass( 'block-editor-page' ) ) && 0 === editor.id.indexOf( 'editor-' ) ) ) {

				editor.addButton( 'fusion_button', {
					title: 'Avada Builder Element Generator',
					icon: 'insertdatetime',
					onclick: function() {

						// Set editor that triggered shortcode generator.
						FusionPageBuilderApp.shortcodeGeneratorActiveEditor = editor;

						// Open shortcode generator.
						openShortcodeGenerator( $( this ) );
					}
				} );
			}
		} );
	}
}( jQuery ) );
