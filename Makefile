#!/usr/bin/make

# Make and Shell behavior
SHELL = /usr/bin/bash
.DELETE_ON_ERROR:
.DEFAULT_GOAL := all

# Critical Paths
LOGDIR=var/log

# Programs
INSTALL = /usr/bin/install
MKDIRP = /usr/bin/mkdir -p
CP = /usr/bin/cp
RM = /usr/bin/rm
CHMOD = /usr/bin/chmod
BUILD_SYS = npx vite
LINTER = npx eslint
FORMATER = npx prettier
VITEST = npx vitest

.PHONY: all
all: run

.PHONY: run
run: dirs
	NODE_ENV=development $(BUILD_SYS) serve \
	--mode dev $(params)

.PHONY: run-staging
run-stage: dirs
	NODE_ENV=development $(BUILD_SYS) serve \
	--mode staging $(params)

.PHONY: run-prod
run-prod: dirs
	NODE_ENV=development $(BUILD_SYS) serve \
	--mode prod $(params)

.PHONY: build
build:
	NODE_ENV=production $(BUILD_SYS) build \
	--mode dev $(params)

.PHONY: build-staging
build-staging:
	NODE_ENV=production $(BUILD_SYS) build \
	--mode staging $(params)

.PHONY: build-prod
build-prod:
	NODE_ENV=production $(BUILD_SYS) build \
	--mode prod $(params)

.PHONY: test
test:
	NODE_ENV=development $(VITEST) run \
	--reporter verbose --mode dev $(params)

.PHONY: test-staging
test-staging:
	NODE_ENV=development $(VITEST) run \
	--reporter verbose --mode staging $(params)

.PHONY: test-prod
test-prod:
	NODE_ENV=development $(VITEST) run \
	--reporter verbose --mode prod $(params)

.PHONY: lint
lint:
	$(LINTER) --ext js,jsx --fix .

.PHONY: lint-check
lint-check:
	$(LINTER) --ext js,jsx .

.PHONY: fmt
fmt:
	$(FORMATER) --write .

.PHONY: fmt-check
fmt-check:
	$(FORMATER) --check .

dirs:
	$(MKDIRP) $(LOGDIR)
