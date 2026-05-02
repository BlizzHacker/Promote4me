<?php
/**
 * Add an element to fusion-builder.
 *
 * @package fusion-builder
 * @since 2.4
 */

if ( fusion_is_element_enabled( 'fusion_tb_meta' ) ) {

	if ( ! class_exists( 'FusionTB_Meta' ) ) {
		/**
		 * Shortcode class.
		 *
		 * @since 2.4
		 */
		class FusionTB_Meta extends Fusion_Component {

			/**
			 * An array of the shortcode arguments.
			 *
			 * @access protected
			 * @since 2.4
			 * @var array
			 */
			protected $args;

			/**
			 * The internal container counter.
			 *
			 * @access private
			 * @since 2.4
			 * @var int
			 */
			private $counter = 1;

			/**
			 * Constructor.
			 *
			 * @access public
			 * @since 2.4
			 */
			public function __construct() {
				parent::__construct( 'fusion_tb_meta' );
				add_filter( 'fusion_attr_fusion_tb_meta-shortcode', [ $this, 'attr' ] );
				add_filter( 'fusion_pipe_seprator_shortcodes', [ $this, 'allow_separator' ] );

				// Ajax mechanism for live editor.
				add_action( 'wp_ajax_get_fusion_tb_meta', [ $this, 'ajax_render' ] );
			}


			/**
			 * Check if component should render
			 *
			 * @access public
			 * @since 2.4
			 * @return boolean
			 */
			public function should_render() {
				return is_singular();
			}

			/**
			 * Enables pipe separator for short code.
			 *
			 * @access public
			 * @since 2.4
			 * @param array $shortcodes The shortcodes array.
			 * @return array
			 */
			public function allow_separator( $shortcodes ) {
				if ( is_array( $shortcodes ) ) {
					array_push( $shortcodes, 'fusion_tb_meta' );
				}

				return $shortcodes;
			}

			/**
			 * Gets the default values.
			 *
			 * @static
			 * @access public
			 * @since 2.4
			 * @return array
			 */
			public static function get_element_defaults() {
				$fusion_settings = fusion_get_fusion_settings();
				return [
					'meta'                => 'author,published_date,categories,comments,tags',
					'separator'           => '',
					'font_size'           => $fusion_settings->get( 'meta_font_size' ),
					'text_color'          => $fusion_settings->get( 'link_color' ),
					'text_hover_color'    => $fusion_settings->get( 'primary_color' ),
					'border_size'         => 1,
					'border_color'        => $fusion_settings->get( 'sep_color' ),
					'alignment'           => '',
					'height'              => '33',
					'margin_bottom'       => '',
					'margin_left'         => '',
					'margin_right'        => '',
					'margin_top'          => '',
					'hide_on_mobile'      => fusion_builder_default_visibility( 'string' ),
					'class'               => '',
					'id'                  => '',
					'animation_type'      => '',
					'animation_direction' => 'down',
					'animation_speed'     => '0.1',
					'animation_offset'    => $fusion_settings->get( 'animation_offset' ),
				];
			}

			/**
			 * Render for live editor.
			 *
			 * @static
			 * @access public
			 * @since 2.0.0
			 * @param array $defaults An array of defaults.
			 * @return void
			 */
			public function ajax_render( $defaults ) {
				check_ajax_referer( 'fusion_load_nonce', 'fusion_load_nonce' );

				$live_request = false;

				// From Ajax Request.
				if ( isset( $_POST['model'] ) && isset( $_POST['model']['params'] ) && ! apply_filters( 'fusion_builder_live_request', false ) ) { // phpcs:ignore WordPress.Security.NonceVerification
					$defaults     = $_POST['model']['params']; // phpcs:ignore WordPress.Security
					$return_data  = [];
					$live_request = true;
					fusion_set_live_data();
					add_filter( 'fusion_builder_live_request', '__return_true' );
				}

				if ( class_exists( 'Fusion_App' ) && $live_request ) {

					$post_id = isset( $_POST['post_id'] ) ? $_POST['post_id'] : get_the_ID(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
					if ( ( ! $post_id || -99 === $post_id ) || ( isset( $_POST['post_id'] ) && 'fusion_tb_section' === get_post_type( $_POST['post_id'] ) ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
						echo wp_json_encode( [] );
						wp_die();
					}

					$this->emulate_post();
					$return_data['meta'] = $this->get_meta_elements( $defaults );
					$this->restore_post();
				}

				echo wp_json_encode( $return_data );
				wp_die();
			}

			/**
			 * Render the shortcode
			 *
			 * @access public
			 * @since 2.4
			 * @param  array  $args    Shortcode parameters.
			 * @param  string $content Content between shortcode.
			 * @return string          HTML output.
			 */
			public function render( $args, $content = '' ) {
				$defaults = FusionBuilder::set_shortcode_defaults( self::get_element_defaults(), $args, 'fusion_tb_meta' );

				$defaults['border_size'] = FusionBuilder::validate_shortcode_attr_value( $defaults['border_size'], 'px' );
				$defaults['height']      = FusionBuilder::validate_shortcode_attr_value( $defaults['height'], 'px' );

				$this->args = $defaults;

				$this->emulate_post();

				$content = $this->get_meta_elements( $this->args );

				$this->restore_post();

				$content = '<div ' . FusionBuilder::attributes( 'fusion_tb_meta-shortcode' ) . '>' . $content . '</div>';

				$styles = '<style type="text/css">';

				if ( $this->args['border_size'] ) {
					$styles .= '.fusion-body .fusion-meta-tb.fusion-meta-tb-' . $this->counter . '{border-width:' . $this->args['border_size'] . ';}';
				}

				if ( $this->args['border_color'] ) {
					$styles .= '.fusion-body .fusion-meta-tb.fusion-meta-tb-' . $this->counter . '{border-color:' . $this->args['border_color'] . ';}';
				}

				if ( $this->args['text_color'] ) {
					$styles .= '.fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb-' . $this->counter . ',';
					$styles .= '.fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb-' . $this->counter . ' a {';
					$styles .= 'color:' . $this->args['text_color'] . ' !important;';
					$styles .= ';}';
				}

				if ( $this->args['text_hover_color'] ) {
					$styles .= '.fusion-fullwidth .fusion-builder-row.fusion-row .fusion-meta-tb-' . $this->counter . ' a:hover {';
					$styles .= 'color:' . $this->args['text_hover_color'] . ' !important;';
					$styles .= ';}';
				}

				$styles .= '</style>';

				$html = $styles . $content;

				$this->counter++;

				return apply_filters( 'fusion_component_' . $this->shortcode_handle . '_meta', $html, $args );
			}

			/**
			 * Builds the attributes array.
			 *
			 * @access public
			 * @since 2.4
			 * @return array
			 */
			public function attr() {
				$attr = [
					'class' => 'fusion-meta-tb fusion-meta-tb-' . $this->counter,
					'style' => '',
				];

				$attr = fusion_builder_visibility_atts( $this->args['hide_on_mobile'], $attr );

				if ( $this->args['animation_type'] ) {
					$attr = Fusion_Builder_Animation_Helper::add_animation_attributes( $this->args, $attr );
				}

				$attr['style'] .= Fusion_Builder_Margin_Helper::get_margins_style( $this->args );

				if ( $this->args['height'] ) {
					$attr['style'] .= 'min-height:' . $this->args['height'] . ';';
				}

				if ( '' !== $this->args['alignment'] ) {
					$attr['style'] .= 'justify-content:' . $this->args['alignment'] . ';';
				}

				if ( $this->args['font_size'] ) {
					$attr['style'] .= 'font-size:' . $this->args['font_size'] . ';';
				}

				if ( $this->args['class'] ) {
					$attr['class'] .= ' ' . $this->args['class'];
				}

				if ( $this->args['id'] ) {
					$attr['id'] = $this->args['id'];
				}

				return $attr;
			}

			/**
			 * Maps settings to param variables.
			 *
			 * @static
			 * @access public
			 * @since 2.4
			 * @return array
			 */
			public static function settings_to_params() {
				return [
					'sep_color'      => 'border_color',
					'link_color'     => 'text_color',
					'primary_color'  => 'text_hover_color',
					'meta_font_size' => 'font_size',
				];
			}

			/**
			 * Builds HTML for meta elements.
			 *
			 * @static
			 * @access public
			 * @since 2.4
			 * @param array $args The arguments.
			 * @return array
			 */
			public function get_meta_elements( $args ) {
				$options     = explode( ',', $args['meta'] );
				$content     = '';
				$date_format = fusion_library()->get_option( 'date_format' );
				$date_format = $date_format ? $date_format : get_option( 'date_format' );
				$length      = count( $options );
				$separator   = '<span class="fusion-meta-tb-sep">' . $args['separator'] . '</span>';
				$post_type   = get_post_type();
				$author_id   = get_post_field( 'post_author', $this->get_post_id() );
				$categories  = false;

				foreach ( $options as $index => $option ) {
					switch ( $option ) {
						case 'author':
							$link = sprintf(
								'<a href="%1$s" title="%2$s" rel="author">%3$s</a>',
								esc_url( get_author_posts_url( $author_id ) ),
								/* translators: %s: Author's display name. */
								esc_attr( sprintf( __( 'Posts by %s' ), get_the_author_meta( 'display_name', $author_id ) ) ),
								get_the_author_meta( 'display_name', $author_id )
							);
							/* Translators: %s: The author. */
							$content .= '<span class="fusion-tb-author">' . sprintf( esc_html__( 'By %s', 'fusion-builder' ), '<span>' . $link . '</span>' ) . '</span>' . $separator;
							break;
						case 'published_date':
							/* Translators: %s: Date. */
							$content .= '<span class="fusion-tb-published-date">' . sprintf( esc_html__( 'Published On: %s', 'fusion-builder' ), get_the_time( $date_format ) ) . '</span>' . $separator;
							break;
						case 'modified_date':
							/* Translators: %s: Date. */
							$content .= '<span class="fusion-tb-modified-date">' . sprintf( esc_html__( 'Last Updated: %s', 'fusion-builder' ), get_the_modified_date( $date_format ) ) . '</span>' . $separator;
							break;
						case 'categories':
							$categories = '';
							$taxonomies = [
								'avada_portfolio' => 'portfolio_category',
								'avada_faq'       => 'faq_category',
								'product'         => 'product_cat',
								'tribe_events'    => 'tribe_events_cat',
							];

							if ( 'post' === $post_type || isset( $taxonomies[ $post_type ] ) ) {
								$categories = 'post' === $post_type ? get_the_category_list( ', ', '', false ) : get_the_term_list( $this->get_post_id(), $taxonomies[ $post_type ], '', ', ' );
							}
							/* Translators: %s: List of categories. */
							$content .= $categories ? '<span class="fusion-tb-categories">' . sprintf( esc_html__( 'Categories: %s', 'fusion-builder' ), $categories ) . '</span>' . $separator : '';
							break;
						case 'comments':
							ob_start();
							comments_popup_link( esc_html__( '0 Comments', 'fusion-builder' ), esc_html__( '1 Comment', 'fusion-builder' ), esc_html__( '% Comments', 'fusion-builder' ) );
							$comments = ob_get_clean();
							$content .= '<span class="fusion-tb-comments">' . $comments . '</span>' . $separator;
							break;
						case 'tags':
							$tags       = '';
							$taxonomies = [
								'avada_portfolio' => 'portfolio_tags',
								'product'         => 'product_tag',
							];

							if ( 'post' === $post_type || isset( $taxonomies[ $post_type ] ) ) {
								$tags = isset( $taxonomies[ $post_type ] ) ? get_the_term_list( $this->get_post_id(), $taxonomies[ $post_type ], '', ', ', '' ) : get_the_tag_list( '', ', ', '' );
							}

							/* Translators: %s: List of tags. */
							$content .= $tags ? '<span class="fusion-tb-tags">' . sprintf( esc_html__( 'Tags: %s', 'fusion-builder' ), $tags ) . '</span>' . $separator : '';
							break;
						case 'skills':
							$skills     = '';
							$taxonomies = [
								'avada_portfolio' => 'portfolio_tags',
								'product'         => 'product_tag',
							];

							if ( 'avada_portfolio' === $post_type ) {
								$skills = get_the_term_list( $this->get_post_id(), 'portfolio_skills', '', ', ', '' );
							}

							/* Translators: %s: List of skills. */
							$content .= $skills ? apply_filters( 'fusion_portfolio_post_skills_label', '<span class="fusion-tb-skills">' . sprintf( esc_html__( 'Skills Needed: %s', 'fusion-builder' ), $skills ) . '</span>' ) . $separator : '';
							break;
					}
				}

				return $content;
			}

			/**
			 * Load base CSS.
			 *
			 * @access public
			 * @since 3.0
			 * @return void
			 */
			public function add_css_files() {
				FusionBuilder()->add_element_css( FUSION_BUILDER_PLUGIN_DIR . 'assets/css/components/meta.min.css' );
			}
		}
	}

	new FusionTB_Meta();
}

/**
 * Map shortcode to Avada Builder
 *
 * @since 2.4
 */
function fusion_component_meta() {

	global $fusion_settings;

	fusion_builder_map(
		fusion_builder_frontend_data(
			'FusionTB_Meta',
			[
				'name'                    => esc_attr__( 'Meta', 'fusion-builder' ),
				'shortcode'               => 'fusion_tb_meta',
				'icon'                    => 'fusiona-meta-data',
				'class'                   => 'hidden',
				'component'               => true,
				'templates'               => [ 'meta' ],
				'components_per_template' => 1,
				'params'                  => [
					[
						'type'        => 'connected_sortable',
						'heading'     => esc_attr__( 'Meta Elements', 'fusion-builder' ),
						'description' => esc_attr__( 'Choose the order of meta elements.', 'fusion-builder' ),
						'param_name'  => 'meta',
						'default'     => 'author,published_date,categories,comments,tags',
						'choices'     => [
							'author'         => 'Author',
							'published_date' => 'Published Date',
							'modified_date'  => 'Modified Date',
							'categories'     => 'Categories',
							'comments'       => 'Comments',
							'tags'           => 'Tags',
							'skills'         => 'Portfolio Skills',
						],
						'callback'    => [
							'function' => 'fusion_ajax',
							'action'   => 'get_fusion_tb_meta',
							'ajax'     => true,
						],
					],
					[
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Separator', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the type of separator between each meta item.', 'fusion-builder' ),
						'param_name'  => 'separator',
						'escape_html' => true,
						'callback'    => [
							'function' => 'fusion_update_tb_meta_separator',
							'args'     => [
								'selector' => '.fusion-meta-tb',
							],
						],
					],
					[
						'type'        => 'radio_button_set',
						'heading'     => esc_attr__( 'Alignment', 'fusion-builder' ),
						'description' => esc_attr__( 'Select the meta alignment.', 'fusion-builder' ),
						'param_name'  => 'alignment',
						'default'     => 'flex-start',
						'grid_layout' => true,
						'back_icons'  => true,
						'icons'       => [
							'flex-start'    => '<span class="fusiona-horizontal-flex-start"></span>',
							'center'        => '<span class="fusiona-horizontal-flex-center"></span>',
							'flex-end'      => '<span class="fusiona-horizontal-flex-end"></span>',
							'space-between' => '<span class="fusiona-horizontal-space-between"></span>',
							'space-around'  => '<span class="fusiona-horizontal-space-around"></span>',
							'space-evenly'  => '<span class="fusiona-horizontal-space-evenly"></span>',
						],
						'value'       => [
							'flex-start'    => esc_html__( 'Flex Start', 'fusion-builder' ),
							'center'        => esc_html__( 'Center', 'fusion-builder' ),
							'flex-end'      => esc_html__( 'Flex End', 'fusion-builder' ),
							'space-between' => esc_html__( 'Space Between', 'fusion-builder' ),
							'space-around'  => esc_html__( 'Space Around', 'fusion-builder' ),
							'space-evenly'  => esc_html__( 'Space Evenly', 'fusion-builder' ),
						],
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'range',
						'heading'     => esc_attr__( 'Height', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the Meta section height. In pixels.', 'fusion-builder' ),
						'param_name'  => 'height',
						'value'       => '36',
						'min'         => '0',
						'max'         => '200',
						'step'        => '1',
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Text Font Size', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the font size for the meta text. Enter value including CSS unit (px, em, rem), ex: 10px', 'fusion-builder' ),
						'param_name'  => 'font_size',
						'value'       => '',
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'colorpickeralpha',
						'heading'     => esc_attr__( 'Text Color', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the text color of the meta section text.', 'fusion-builder' ),
						'param_name'  => 'text_color',
						'value'       => '',
						'default'     => $fusion_settings->get( 'link_color' ),
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'colorpickeralpha',
						'heading'     => esc_attr__( 'Text Hover Color', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the text hover color of the meta section text.', 'fusion-builder' ),
						'param_name'  => 'text_hover_color',
						'value'       => '',
						'default'     => $fusion_settings->get( 'primary_color' ),
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'range',
						'heading'     => esc_attr__( 'Separator Border Size', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the border size of the separators. In pixels.', 'fusion-builder' ),
						'param_name'  => 'border_size',
						'value'       => '1',
						'min'         => '0',
						'max'         => '50',
						'step'        => '1',
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'colorpickeralpha',
						'heading'     => esc_attr__( 'Separator Border Color', 'fusion-builder' ),
						'description' => esc_attr__( 'Controls the border color of the separators.', 'fusion-builder' ),
						'param_name'  => 'border_color',
						'value'       => '',
						'default'     => $fusion_settings->get( 'sep_color' ),
						'dependency'  => [
							[
								'element'  => 'border_size',
								'value'    => '0',
								'operator' => '!=',
							],
						],
						'group'       => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'             => 'dimension',
						'remove_from_atts' => true,
						'heading'          => esc_attr__( 'Margin', 'fusion-builder' ),
						'description'      => esc_attr__( 'In pixels or percentage, ex: 10px or 10%.', 'fusion-builder' ),
						'param_name'       => 'margin',
						'value'            => [
							'margin_top'    => '',
							'margin_right'  => '',
							'margin_bottom' => '',
							'margin_left'   => '',
						],
						'group'            => esc_attr__( 'Design', 'fusion-builder' ),
					],
					[
						'type'        => 'checkbox_button_set',
						'heading'     => esc_attr__( 'Element Visibility', 'fusion-builder' ),
						'param_name'  => 'hide_on_mobile',
						'value'       => fusion_builder_visibility_options( 'full' ),
						'default'     => fusion_builder_default_visibility( 'array' ),
						'description' => esc_attr__( 'Choose to show or hide the element on small, medium or large screens. You can choose more than one at a time.', 'fusion-builder' ),
					],
					[
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'CSS Class', 'fusion-builder' ),
						'description' => esc_attr__( 'Add a class to the wrapping HTML element.', 'fusion-builder' ),
						'param_name'  => 'class',
						'value'       => '',
					],
					[
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'CSS ID', 'fusion-builder' ),
						'description' => esc_attr__( 'Add an ID to the wrapping HTML element.', 'fusion-builder' ),
						'param_name'  => 'id',
						'value'       => '',
					],
					'fusion_animation_placeholder' => [
						'preview_selector' => '.fusion-meta-tb',
					],
				],
				'callback'                => [
					'function' => 'fusion_ajax',
					'action'   => 'get_fusion_tb_meta',
					'ajax'     => true,
				],
			]
		)
	);
}
add_action( 'fusion_builder_before_init', 'fusion_component_meta' );
