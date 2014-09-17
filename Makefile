REPORTER = spec
DEBUG = "osiris,OsirisEndpoint,OsirisService"

test:
	@NODE_ENV=test DEBUG=${DEBUG} \
		./node_modules/.bin/mocha \
		--bail \
		--reporter $(REPORTER)

watch:
	@NODE_ENV=test DEBUG=${DEBUG} \
		./node_modules/.bin/mocha \
		-c -w \
		--bail \
		--reporter $(REPORTER) \

.PHONY: test

# test:
# 	@./node_modules/.bin/mocha

# watch-service:
# 	@./node_modules/.bin/mocha -c -w --grep OsirisService

# watch-endpoint:
# 	@./node_modules/.bin/mocha -c -w --grep OsirisEndpoint

# watch:
# 	@./node_modules/.bin/mocha -c -w

#  # -i --grep osiris
# .PHONY: test