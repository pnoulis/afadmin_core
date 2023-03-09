#!/usr/bin/make

# Make and Shell behavior
SHELL = /usr/bin/bash
.DELETE_ON_ERROR:
.DEFAULT_GOAL = run

# Programs
INSTALL = /usr/bin/install
MKDIRP = /usr/bin/mkdir -p
CP = /usr/bin/cp
RM = /usr/bin/rm
CHMOD = /usr/bin/chmod
BUILD_SYS = npm exec vite
LINTER = eslint
FORMATER = prettier

.PHONY: all
all: run

.PHONY: run
run:
	$(BUILD_SYS) serve

.PHONY: build
build:
	$(BUILD_SYS) build

.PHONY: lint
lint:
	$(LINTER) --ext js,jsx --fix .

.PHONY: lint-check
lint-check:
	$(LINTER) --ext js,jsx .

.PHONY: lint-dry
lint-dry:
	$(LINTER) --ext js,jsx --fix-dry-run .

.PHONY: fmt
fmt:
	$(FORMATER) --write .

.PHONY: fmt-check
fmt-check:
	$(FORMATER) --check .

.PHONY: fmt-dry
fmt-dry:
	$(FORMATER) .
