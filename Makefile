test:
	@./node_modules/.bin/mocha

watch-service:
	@./node_modules/.bin/mocha -c -w --grep OsirisService

watch-endpoint:
	@./node_modules/.bin/mocha -c -w --grep OsirisEndpoint

watch:
	@./node_modules/.bin/mocha -c -w -i --grep osiris

.PHONY: test