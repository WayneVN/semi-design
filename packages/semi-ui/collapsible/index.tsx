// @ts-ignore  currently no type definition for @douyinfe/semi-animation-react
import { Transition } from '@douyinfe/semi-animation-react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import React, { useRef, useState, useCallback } from 'react';
import { cssClasses } from '@douyinfe/semi-foundation/collapsible/constants';
import { Motion } from '../_base/base';
import getMotionObjFromProps from '@douyinfe/semi-foundation/utils/getMotionObjFromProps';

const ease = 'cubicBezier(.25,.1,.25,1)';

export interface CollapsibleProps {
    motion?: Motion;
    children?: React.ReactNode;
    isOpen?: boolean;
    duration?: number;
    keepDOM?: boolean;
    className?: string;
    style?: React.CSSProperties;
    collapseHeight?: number;
    reCalcKey?: number | string;
}


const Collapsible = (props: CollapsibleProps) => {
    const {
        motion,
        children,
        isOpen,
        duration,
        keepDOM,
        collapseHeight,
        style,
        className,
        reCalcKey
    } = props;

    const ref = useRef(null);
    const [maxHeight, setMaxHeight] = useState(0);
    const [open, setOpen] = useState(props.isOpen);
    const [isFirst, setIsFirst] = useState(true);
    const [transitionImmediate, setTransitionImmediate] = useState(open && isFirst);
    const [left, setLeft] = useState(!props.isOpen);
    if (isOpen !== open) {
        setOpen(isOpen);
        if (isFirst) {
            setIsFirst(false);
            setTransitionImmediate(false);
        }
        isOpen && setLeft(!isOpen);
    }

    const setHeight = useCallback(node => {
        const currHeight = node && node.scrollHeight;
        if (currHeight && maxHeight !== currHeight) {
            setMaxHeight(currHeight);
        }
    }, [left, reCalcKey, maxHeight]);

    const resetHeight = () => {
        ref.current.style.maxHeight = 'none';
    };

    const formatStyle = ({ maxHeight: maxHeightInTransitionStyle }: any) => ({ maxHeight: maxHeightInTransitionStyle });

    const shouldKeepDOM = () => keepDOM || collapseHeight !== 0;

    const renderChildren = (transitionStyle: Record<string, any>) => {
        const transition =
            transitionStyle && typeof transitionStyle === 'object' ?
                formatStyle(transitionStyle) :
                {};

        const wrapperstyle = {
            overflow: 'hidden',
            maxHeight: (isOpen || !shouldKeepDOM() && !motion) ? 'none' : collapseHeight,
            ...style,
            ...transition,
        };
        const wrapperCls = cls(`${cssClasses.PREFIX}-wrapper`, className);
        return (
            <div style={wrapperstyle} className={wrapperCls} ref={ref}>
                <div ref={setHeight}>{children}</div>
            </div>
        );
    };

    const didLeave = () => {
        setLeft(true);
        !shouldKeepDOM() && setMaxHeight(collapseHeight);
    };

    const renderContent = () => {
        if (left && !shouldKeepDOM()) {
            return null;
        }

        const mergedMotion = getMotionObjFromProps({
            didEnter: resetHeight,
            didLeave,
            motion,
        });

        return (
            <Transition
                state={isOpen ? 'enter' : 'leave'}
                immediate={transitionImmediate}
                from={{ maxHeight: 0 }}
                enter={{ maxHeight: { val: maxHeight, easing: ease, duration } }}
                leave={{ maxHeight: { val: collapseHeight, easing: ease, duration } }}
                {...mergedMotion}
            >
                {(transitionStyle: Record<string, any>) =>
                    renderChildren(motion ? transitionStyle : null)
                }
            </Transition>
        );
    };

    return renderContent();
};

Collapsible.propType = {
    motion: PropTypes.oneOfType([PropTypes.bool, PropTypes.func, PropTypes.object]),
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    duration: PropTypes.number,
    keepDOM: PropTypes.bool,
    collapseHeight: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    reCalcKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
};

Collapsible.defaultProps = {
    isOpen: false,
    duration: 250,
    motion: true,
    keepDOM: false,
    collapseHeight: 0
};

export default Collapsible;