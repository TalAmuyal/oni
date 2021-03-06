import * as React from "react"

import { connect } from "react-redux"

import * as _ from "lodash"

import * as ActionCreators from "./../ActionCreators"
import * as State from "./../State"

import { Icon } from "./../Icon"

import { HighlightTextByIndex } from "./HighlightText"
import { Visible } from "./Visible"

/**
 * Popup menu
 */
require("./Menu.less") // tslint:disable-line no-var-requires

export interface IMenuProps {
    visible: boolean
    selectedIndex: number
    filterText: string
    onChangeFilterText: (text: string) => void
    items: State.IMenuOptionWithHighlights[]
}

export class Menu extends React.Component<IMenuProps, void> {

    private _inputElement: HTMLInputElement = null as any // FIXME: null

    public render(): null | JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const initialItems = _.take(this.props.items, 10)

        // const pinnedItems = initialItems.filter(f => f.pinned)
        // const unpinnedItems = initialItems.filter(f => !f.pinned)
        const items = initialItems.map((menuItem, index) => <MenuItem {...menuItem as any} // FIXME: undefined
            filterText={this.props.filterText}
            isSelected={index === this.props.selectedIndex}
            />)

        return <div className="menu-background">
            <div className="menu">
                <input type="text"
                    ref={(inputElement) => {
                        this._inputElement = inputElement
                        if (this._inputElement) {
                            this._inputElement.focus()
                        }
                    }}
                    onChange={(evt) => this._onChange(evt)}
                    />
                <div className="items">
                    {items}
                </div>
            </div>
        </div>
    }

    private _onChange(evt: React.FormEvent<HTMLInputElement>) {
        const target: any = evt.target
        this.props.onChangeFilterText(target.value)
    }
}

const mapStateToProps = (state: State.IState) => {
    if (!state.popupMenu) {
        return {
            visible: false,
            selectedIndex: 0,
            filterText: "",
            items: [],
        }
    } else {
        const popupMenu = state.popupMenu
        return {
            visible: true,
            selectedIndex: popupMenu.selectedIndex,
            filterText: popupMenu.filter,
            items: popupMenu.filteredOptions,
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {

    const dispatchFilterText = (text: string) => {
        dispatch(ActionCreators.filterMenu(text))
    }

    return {
        onChangeFilterText: dispatchFilterText,
    }
}

export const MenuContainer = connect(mapStateToProps, mapDispatchToProps)(Menu)

export interface IMenuItemProps {
    icon?: string
    isSelected: boolean
    filterText: string
    label: string
    labelHighlights: number[]
    detail: string
    detailHighlights: number[]
    pinned: boolean
}

export class MenuItem extends React.Component<IMenuItemProps, void> {

    public render(): JSX.Element {
        let className = "item"

        if (this.props.isSelected) {
            className += " selected"
        }

        const icon = this.props.icon ? <Icon name={this.props.icon} /> : null

        return <div className={className}>
            {icon}
            <HighlightTextByIndex className="label" text={this.props.label} highlightIndices={this.props.labelHighlights} highlightClassName={"highlight"} />
            <HighlightTextByIndex className="detail" text={this.props.detail} highlightIndices={this.props.detailHighlights} highlightClassName={"highlight"} />
            <Visible visible={this.props.pinned}>
                <Icon name="clock-o" />
            </Visible>
        </div>
    }
}
