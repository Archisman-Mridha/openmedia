render:
	rm -rf renderred
	tk export ./renderred/ ./environments/ \
		--recursive \
		--format "{{env.metadata.name}}/{{(index .metadata.labels \"app.tanka.grafana.com\")}}/{{.kind}}/{{.metadata.name}}"
