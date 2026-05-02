var FusionPageBuilder = FusionPageBuilder || {};

( function() {

	jQuery( document ).ready( function() {

		// Meta Component View.
		FusionPageBuilder.fusion_tb_meta = FusionPageBuilder.ElementView.extend( {

			/**
			 * Modify template attributes.
			 *
			 * @since 2.4
			 * @param {Object} atts - The attributes.
			 * @return {Object}
			 */
			filterTemplateAtts: function( atts ) {
				var attributes = {};

				// Validate values.
				this.validateValues( atts.values );

				// Any extras that need passed on.
				attributes.cid         = this.model.get( 'cid' );
				attributes.wrapperAttr = this.buildAttr( atts.values );
				attributes.styles      = this.buildStyleBlock( atts.values );
				attributes.output      = this.buildOutput( atts );

				return attributes;
			},

			/**
			 * Modifies the values.
			 *
			 * @since  2.2
			 * @param  {Object} values - The values object.
			 * @return {void}
			 */
			validateValues: function( values ) {
				values.border_size = _.fusionValidateAttrValue( values.border_size, 'px' );
				values.height      = _.fusionValidateAttrValue( values.height, 'px' );
			},

			/**
			 * Builds attributes.
			 *
			 * @since  2.4
			 * @param  {Object} values - The values object.
			 * @return {Object}
			 */
			buildAttr: function( values ) {
				var attr         = _.fusionVisibilityAtts( values.hide_on_mobile, {
						class: 'fusion-meta-tb fusion-meta-tb-' + this.model.get( 'cid' ),
						style: ''
					} );

				if ( '' !== values.margin_top ) {
					attr.style += 'margin-top:' + values.margin_top + ';';
				}

				if ( '' !== values.margin_right ) {
					attr.style += 'margin-right:' + values.margin_right + ';';
				}

				if ( '' !== values.margin_bottom ) {
					attr.style += 'margin-bottom:' + values.margin_bottom + ';';
				}

				if ( '' !== values.margin_left ) {
					attr.style += 'margin-left:' + values.margin_left + ';';
				}

				if ( '' !== values.alignment ) {
					attr.style += 'justify-content:' + values.alignment + ';';
				}

				if ( '' !== values.height ) {
					attr.style += 'min-height:' + values.height + ';';
				}

				if ( '' !== values.font_size ) {
					attr.style += 'font-size:' + values.font_size + ';';
				}

				if ( '' !== values[ 'class' ] ) {
					attr[ 'class' ] += ' ' + values[ 'class' ];
				}

				if ( '' !== values.id ) {
					attr.id = values.id;
				}

				attr = _.fusionAnimations( values, attr );

				return attr;
			},

			/**
			 * Builds output.
			 *
			 * @since  2.2
			 * @param  {Object} values - The values object.
			 * @return {String}
			 */
			buildOutput: function( atts ) {
				var output = '';

				if ( 'undefined' !== typeof atts.markup && 'undefined' !== typeof atts.markup.output && 'undefined' === typeof atts.query_data ) {
					output = jQuery( jQuery.parseHTML( atts.markup.output ) ).filter( '.fusion-meta-tb' ).html();
					output = ( 'undefined' === typeof output ) ? atts.markup.output : output;
				} else if ( 'undefined' !== typeof atts.query_data && 'undefined' !== typeof atts.query_data.meta ) {
					output = atts.query_data.meta;
				}

				return output;
			},

			/**
			 * Builds styles.
			 *
			 * @since  2.4
			 * @param  {Object} values - The values object.
			 * @return {String}
			 */
			buildStyleBlock: function( values ) {
				var styles = '<style type="text/css">';

				if ( '' !== values.border_size ) {
					styles += '.fusion-body .fusion-meta-tb.fusion-meta-tb-' + this.model.get( 'cid' ) + '{border-width:' + values.border_size + ';}';
				}

				if ( '' !== values.border_color ) {
					styles += '.fusion-body .fusion-meta-tb.fusion-meta-tb-' + this.model.get( 'cid' ) + '{border-color:' + values.border_color + ' !important;}';
				}

				if ( '' !== values.text_color ) {
					styles += '.fusion-body .fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb.fusion-meta-tb-' + this.model.get( 'cid' ) + ',';
					styles += '.fusion-body .fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb.fusion-meta-tb-' + this.model.get( 'cid' ) + ' a{';
					styles += 'color:' + values.text_color + ';';
					styles += '}';
				}

				if ( '' !== values.text_hover_color ) {
					styles += '.fusion-body .fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb.fusion-meta-tb-' + this.model.get( 'cid' ) + ' a:hover {';
					styles += 'color:' + values.text_hover_color + ';';
					styles += '}';
				}

				styles += '</style>';

				return styles;
			}
		} );
	} );
}( jQuery ) );
