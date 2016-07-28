<div class="filter-inner">
	{{ #menu }}
	<div class="filter-menu filter-menu-{{ name }}">
		<em>{{ title }}</em>
		<div class="menu-content">
			<div class="shadow"></div>
			<ul class="menu-inner">
				{{ #item }}
				<li class="menu-item {{ #curr }}current-item{{ /curr }}">
					<div class="item-content">{{ content }}</div>
				</li>
				{{ /item }}
			</ul>
		</div>
	</div>
	{{ /menu }}
</div>