test:
	@./node_modules/.bin/mocha

watch:
	@./node_modules/.bin/mocha -c -w

.PHONY: test