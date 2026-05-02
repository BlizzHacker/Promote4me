/* global FusionPageBuilderApp, fusionAllElements */
var FusionPageBuilder = FusionPageBuilder || {};

( function() {

	jQuery( document ).ready( function() {

		// Section separator view.
		FusionPageBuilder.fusion_section_separator = FusionPageBuilder.ElementView.extend( {

			/**
			 * Runs after view DOM is patched.
			 *
			 * @since 2.0
			 * @return {void}
			 */
			onRender: function() {
				this.afterPatch();
			},

			/**
			 * Runs after view DOM is patched.
			 *
			 * @since 2.0
			 * @return {void}
			 */
			afterPatch: function() { // eslint-disable-line no-empty-function
			},

			/**
			 * Modify template attributes.
			 *
			 * @since 2.0
			 * @param {Object} atts - The attributes.
			 * @return {Object}
			 */
			filterTemplateAtts: function( atts ) {
				var attributes = {};

				// Validate values.
				this.validateValues( atts.values );

				this.extras = atts.extras;

				// Create attribute objects
				attributes.attr             = this.buildAtts( atts.values );
				attributes.attrSvgWrapper   = this.buildSvgWrapperAtts( atts.values );
				attributes.attrSpacer       = this.buildSpacerAtts( atts.values );
				attributes.attrSpacerHeight = this.buildSpacerHeightAtts( atts.values );
				attributes.attrCandyArrow   = this.buildCandyArrowAtts( atts.values );
				attributes.attrCandy        = this.buildCandyAtts( atts.values );
				attributes.attrSVG          = this.buildSVGAtts( atts.values );
				attributes.attrButton       = this.buildButtonAtts( atts.values );
				attributes.attrRoundedSplit = this.buildRoundedSplitAtts( atts.values );
				attributes.values           = atts.values;

				return attributes;
			},

			/**
			 * Modifies the values.
			 *
			 * @since 2.0
			 * @param {Object} values - The values object.
			 * @return {void}
			 */
			validateValues: function( values ) {
				if ( ! isNaN( values.bordersize ) ) {
					values.bordersize = _.fusionGetValueWithUnit( values.bordersize );
				}

				values.borderSizeWithoutUnits = parseInt( values.bordersize.match( /\d+/ ), 10 );

				if ( 'horizon' === values.divider_type ) {
					values.yMin = 'top' === values.divider_candy ? '-0.5' : '0';
				} else if ( 'hills_opacity' === values.divider_type ) {
					values.yMin = 'top' === values.divider_candy ? '-0.5' : '0';
				} else if ( 'waves' === values.divider_type ) {
					values.yMin = 'top' === values.divider_candy ? '54' : '1';
				} else if ( 'waves_opacity' === values.divider_type ) {
					values.yMin = 'top' === values.divider_candy ? '0' : '1';
				}
			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildAtts: function( values ) {
				var attr = _.fusionVisibilityAtts( values.hide_on_mobile, {
						class: 'fusion-section-separator section-separator ' + values.divider_type + ' fusion-section-separator-' + this.model.get( 'cid' ),
						style: ''
					} );

				if ( 'rounded-split' === values.divider_type ) {
					attr[ 'class' ] += ' rounded-split-separator';
				}

				if ( '' !== values[ 'class' ] ) {
					attr[ 'class' ] += ' ' + values[ 'class' ];
				}

				if ( '' !== values.id ) {
					attr.id = values.id;
				}

				return attr;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 3.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildSvgWrapperAtts: function( values ) {
				var attr = {
						class: 'fusion-section-separator-svg'
					},
					parentContainernView  = FusionPageBuilderApp.getParentContainer( this ),
					parentContainerValues = 'undefined' !== typeof parentContainernView.values ? parentContainernView.values : {},
					parentColumnView      = FusionPageBuilderApp.getParentColumn( this ),
					parentColumnValues    = 'undefined' !== typeof parentColumnView.values ? parentColumnView.values : {},
					extras                = jQuery.extend( true, {}, fusionAllElements.fusion_section_separator.extras ),
					self                  = this,
					paddingValueLeft      = '',
					paddingValueRight     = '',
					columnOuterWidth      = jQuery( parentColumnView.$el ).width(),
					columnWidth           = jQuery( parentColumnView.$el ).children( '.fusion-column-wrapper' ).width();

					if ( 'triangle' === values.divider_type ) {
						if ( '' !== values.bordercolor ) {
							if ( 'bottom' === values.divider_candy ) {
								attr.style = 'border-bottom:' + values.bordersize + ' solid ' + values.bordercolor + ';';
							} else if ( 'top' === values.divider_candy ) {
								attr.style = 'border-top:' + values.bordersize + ' solid ' + values.bordercolor + ';';
							} else if ( -1 !== values.divider_candy.indexOf( 'top' ) && -1 !== values.divider_candy.indexOf( 'bottom' ) ) {
								attr.style = 'border:' + values.bordersize + ' solid ' + values.bordercolor + ';';
							}
						}
					} else if ( 'bigtriangle' === values.divider_type || 'slant' === values.divider_type || 'big-half-circle' === values.divider_type || 'clouds' === values.divider_type || 'curved' === values.divider_type ) {
						attr.style = 'padding:0;';
					} else if ( 'horizon' === values.divider_type || 'waves' === values.divider_type || 'waves_opacity' === values.divider_type || 'hills' === values.divider_type || 'hills_opacity' === values.divider_type ) {
						attr.style = 'font-size:0;line-height:0;';
					}

					values.additional_styles = '';

					if ( _.isObject( parentColumnValues ) ) {
						if ( FusionPageBuilderApp.$el.find( '#main' ).hasClass( 'width-100' ) && '1_1' === parentColumnValues.type ) {
							if ( 'boxed' === extras.layout && _.isObject( parentContainerValues ) ) {
								_.each( [ 'large', 'medium', 'small' ], function( size ) {
									if ( 'large' === size ) {
										values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
										values.additional_styles += 'position: relative;';
										values.additional_styles += 'margin-left:-' + parentContainerValues.padding_left + ';';
										values.additional_styles += 'margin-right:-' + parentContainerValues.padding_right + ';';
										values.additional_styles += '}';
									} else if ( ( 'undefined' !== typeof parentContainerValues[ 'padding_left_' + size ] && ! _.isEmpty( parentContainerValues[ 'padding_left_' + size ] ) ) || ( 'undefined' !== typeof parentContainerValues[ 'padding_right_' + size ] && ! _.isEmpty( parentContainerValues[ 'padding_right_' + size ] ) ) ) {
										// Medium and Small size screen styles.
										values.additional_styles += '@media only screen and (max-width:' + extras[ 'visibility_' + size ] + 'px) {';
										values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
										values.additional_styles += 'margin-left:-' + parentContainerValues[ 'padding_left_' + size ] + ';';
										values.additional_styles += 'margin-right:-' + parentContainerValues[ 'padding_right_' + size ] + ';';
										values.additional_styles += '}';
										values.additional_styles += '}';
									}
								} );

							} else {
								attr[ 'class' ] += ' fusion-section-separator-fullwidth';
							}
						}
						if ( ! ( FusionPageBuilderApp.$el.find( '#main' ).hasClass( 'width-100' ) && 'boxed' === extras.layout ) ) {
							if ( '1_1' === parentColumnValues.type ) {
								if ( 'undefined' !== typeof parentColumnValues.upsized_spacing_left && 'undefined' !== typeof parentColumnValues.upsized_spacing_left_medium && 'undefined' !== typeof parentColumnValues.upsized_spacing_left_small ) {
									_.each( [ 'large', 'medium', 'small' ], function( size ) {
										if ( 'large' === size ) {
											if ( ! _.isEmpty( parentColumnValues.upsized_spacing_left ) ) {
												values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
												values.additional_styles += 'margin-left:-' + parentColumnValues.upsized_spacing_left + ';';
												values.additional_styles += 'margin-right:-' + parentColumnValues.upsized_spacing_right + ';';
												values.additional_styles += '}';
											}
										} else if ( ! _.isEmpty( parentColumnValues[ 'upsized_spacing_left_' + size ] ) ) {
											// Medium and Small size screen styles.
											values.additional_styles += '@media only screen and (max-width:' + extras[ 'visibility_' + size ] + 'px) {';
											values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
											values.additional_styles += 'margin-left:-' + parentColumnValues[ 'upsized_spacing_left_' + size ] + ' !important;';
											values.additional_styles += 'margin-right:-' + parentColumnValues[ 'upsized_spacing_right_' + size ] +  ' !important;';
											values.additional_styles += '}';
											values.additional_styles += '}';
										}
									} );
								}
							} else {
								_.each( [ 'large', 'medium', 'small' ], function( size ) {
									if ( 'large' === size ) {
										if ( ! _.isEmpty( parentColumnValues.padding_left ) ) {
											paddingValueLeft = parentColumnValues.padding_left;
											if ( -1 !== paddingValueLeft.indexOf( '%' ) ) {
												paddingValueLeft = ( parseFloat( paddingValueLeft.replace( '%', '' ) ) / ( columnWidth / columnOuterWidth ) ) + '%';
											}

											paddingValueRight = parentColumnValues.padding_right;
											if ( -1 !== paddingValueRight.indexOf( '%' ) ) {
												paddingValueRight = ( parseFloat( paddingValueRight.replace( '%', '' ) ) / ( columnWidth / columnOuterWidth ) ) + '%';
											}

											values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
											values.additional_styles += 'margin-left:-' + paddingValueLeft + ';';
											values.additional_styles += 'margin-right:-' + paddingValueRight + ';';
											values.additional_styles += '}';
										}
									} else if ( ! _.isEmpty( parentColumnValues[ 'padding_left_' + size ] ) ) {
										// Medium and Small size screen styles.

										paddingValueLeft = parentColumnValues[ 'padding_left_' + size ];
										if ( -1 !== paddingValueLeft.indexOf( '%' ) ) {
											paddingValueLeft = ( parseFloat( paddingValueLeft.replace( '%', '' ) ) / ( columnWidth / columnOuterWidth ) ) + '%';
										}

										paddingValueRight = parentColumnValues[ 'padding_right_' + size ];
										if ( -1 !== paddingValueRight.indexOf( '%' ) ) {
											paddingValueRight = ( parseFloat( paddingValueRight.replace( '%', '' ) ) / ( columnWidth / columnOuterWidth ) ) + '%';
										}

										values.additional_styles += '@media only screen and (max-width:' + extras[ 'visibility_' + size ] + 'px) {';
										values.additional_styles += '.fusion-section-separator-' + self.model.get( 'cid' ) + ' .fusion-section-separator-svg {';
										values.additional_styles += 'margin-left:-' + paddingValueLeft + ' !important;';
										values.additional_styles += 'margin-right:-' + paddingValueRight +  ' !important;';
										values.additional_styles += '}';
										values.additional_styles += '}';
									}
								} );
							}
						}
					}

				return attr;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 3.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildSpacerAtts: function( values ) { // eslint-disable-line no-unused-vars
				var attrSpacer = {
						class: 'fusion-section-separator-spacer'
					},
					parentColumnView   = FusionPageBuilderApp.getParentColumn( this ),
					parentColumnValues = 'undefined' !== typeof parentColumnView.values ? parentColumnView.values : {},
					extras             = jQuery.extend( true, {}, fusionAllElements.fusion_section_separator.extras );

				// 100% width template && 1/1 column.
				if ( FusionPageBuilderApp.$el.find( '#main' ).hasClass( 'width-100' ) && 'undefined' !== typeof parentColumnValues.type && '1_1' === parentColumnValues.type ) {
					if ( 'wide' === extras.layout ) {
						attrSpacer[ 'class' ] += ' fusion-section-separator-fullwidth';
					} else {
						attrSpacer.style = 'display: none;';
					}
				}

				return attrSpacer;

			},

			/**
			 * Builds attributes.
			 *
			 * @since 3.0
			 * @param {Object} v//alues - The values.
			 * @return {Object}//
			 */
			buildSpacerHeightAtts: function( values ) {
				var attrSpacerHeight = {
						class: 'fusion-section-separator-spacer-height'
					},
					hundredPxSeparators = [ 'slant', 'bigtriangle', 'curved', 'big-half-circle', 'clouds' ];

				if ( -1 !== jQuery.inArray( values.divider_type, hundredPxSeparators ) ) {
					attrSpacerHeight.style = 'height:99px;';
				} else if ( 'triangle' === values.divider_type ) {
					if ( values.bordercolor ) {
						if ( 'bottom' === values.divider_candy || 'top' === values.divider_candy ) {
							attrSpacerHeight.style = 'height:' + values.bordersize + ';';
						} else if ( -1 !== values.divider_candy.indexOf( 'top' ) && -1 !== values.divider_candy.indexOf( 'bottom' ) ) {
							attrSpacerHeight.style = 'height:calc( ' + values.bordersize + ' * 2 );';
						}
					}
				} else if ( 'rounded-split' === values.divider_type ) {
					attrSpacerHeight.style = 'height:71px;';
				} else if ( 'hills_opacity' === values.divider_type ) {
					attrSpacerHeight.style = 'padding-top:' + ( 182 / 1024 * 100 ) + '%;';
				} else if ( 'hills' === values.divider_type ) {
					attrSpacerHeight.style = 'padding-top:' + ( 107 / 1024 * 100 ) + '%;';
				} else if ( 'horizon' === values.divider_type ) {
					attrSpacerHeight.style = 'padding-top:' + ( 178 / 1024 * 100 ) + '%;';
				} else if ( 'waves_opacity' === values.divider_type ) {
					attrSpacerHeight.style = 'padding-top:' + ( 216 / 1024 * 100 ) + '%;';
				} else if ( 'waves' === values.divider_type ) {
					attrSpacerHeight.style = 'padding-top:' + ( 162 / 1024 * 100 ) + '%;';
				}
				return attrSpacerHeight;

			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} v//alues - The values.
			 * @return {Object}//
			 */
			buildCandyAtts: function( values ) {
				var attrCandy = {
					class: 'divider-candy'
				};

				if ( 'bottom' === values.divider_candy ) {
					attrCandy[ 'class' ] += ' bottom';
					attrCandy.style = 'bottom:-' + ( values.borderSizeWithoutUnits + 20 ) + 'px;border-bottom:1px solid ' + values.bordercolor + ';border-left:1px solid ' + values.bordercolor + ';';
				} else if ( 'top' === values.divider_candy ) {
					attrCandy[ 'class' ] += ' top';
					attrCandy.style = 'top:-' + ( values.borderSizeWithoutUnits + 20 ) + 'px;border-bottom:1px solid ' + values.bordercolor + ';border-left:1px solid ' + values.bordercolor + ';';

					// Modern setup, that won't work in IE8.
				} else if ( -1 !== values.divider_candy.indexOf( 'top' ) && -1 !== values.divider_candy.indexOf( 'bottom' ) ) {
					attrCandy[ 'class' ] += ' both';
					attrCandy.style = 'background-color:' + values.backgroundcolor + ';border:1px solid ' + values.bordercolor + ';';
				}

				if ( -1 !== values.divider_candy.indexOf( 'top' ) && -1 !== values.divider_candy.indexOf( 'bottom' ) ) {
					attrCandy[ 'class' ] += ' triangle';
				}
				return attrCandy;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildCandyArrowAtts: function( values ) {
				var attrCandyArrow = {
					class: 'divider-candy-arrow'
				};

				// For borders of size 1, we need to hide the border line on the arrow, thus we set it to 0.
				var arrowPosition = values.borderSizeWithoutUnits;
				if ( 1 === arrowPosition ) {
					arrowPosition = 0;
				}

				if ( 'bottom' === values.divider_candy ) {
					attrCandyArrow[ 'class' ] += ' bottom';
					attrCandyArrow.style  = 'top:' + arrowPosition + 'px;border-top-color: ' + values.backgroundcolor + ';';
				} else if ( 'top' === values.divider_candy ) {
					attrCandyArrow[ 'class' ] += ' top';
					attrCandyArrow.style  = 'bottom:' + arrowPosition + 'px;border-bottom-color: ' + values.backgroundcolor + ';';
				}

				return attrCandyArrow;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildSVGAtts: function( values ) {
				var attrSVG = {
					display: 'block'
				};

				if ( 'bigtriangle' === values.divider_type || 'slant' === values.divider_type || 'big-half-circle' === values.divider_type || 'clouds' === values.divider_type || 'curved' === values.divider_type ) {
					attrSVG.style = 'fill:' + values.backgroundcolor + ';padding:0;';
				}
				if ( 'slant' === values.divider_type && 'bottom' === values.divider_candy ) {
					attrSVG.style = 'fill:' + values.backgroundcolor + ';padding:0;margin-bottom:-3px;display:block';
				}

				if ( 'horizon' === values.divider_type || 'hills' === values.divider_type || 'hills_opacity' === values.divider_type || 'waves' === values.divider_type || 'waves_opacity' === values.divider_type ) {
					attrSVG.style = 'fill:' + values.backgroundcolor;
				}

				return attrSVG;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildButtonAtts: function( values ) {
				var attrButton = {};

				if ( '' !== values.icon ) {
					attrButton = {
						class: 'section-separator-icon icon ' + _.fusionFontAwesome( values.icon ),
						style: 'color:' + values.icon_color + ';'
					};

					if ( ! values.icon_color ) {
						values.icon_color = values.bordercolor;
					}

					if ( 1 < values.borderSizeWithoutUnits ) {
						if ( 'bottom' === values.divider_candy ) {
							attrButton.style += 'bottom:-' + ( values.borderSizeWithoutUnits + 10 ) + 'px;top:auto;';
						} else if ( 'top' === values.divider_candy ) {
							attrButton.style += 'top:-' + ( values.borderSizeWithoutUnits + 10 ) + 'px;';
						}
					}
				}

				return attrButton;
			},

			/**
			 * Builds attributes.
			 *
			 * @since 2.0
			 * @param {Object} values - The values.
			 * @return {Object}
			 */
			buildRoundedSplitAtts: function( values ) {
				var attrRoundedSplit = {};

				if ( 'rounded-split' === values.divider_type ) {
					attrRoundedSplit = {
						class: 'rounded-split ' + values.divider_candy,
						style: 'background-color:' + values.backgroundcolor + ';'
					};
				}

				return attrRoundedSplit;
			}

		} );
	} );
}( jQuery ) );
